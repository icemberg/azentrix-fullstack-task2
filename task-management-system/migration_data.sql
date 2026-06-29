START TRANSACTION;

-- Step 4: For every existing user, create a personal team
INSERT INTO teams (name, description, avatar_color, is_personal, created_by, created_at, updated_at)
SELECT CONCAT(username, '''s Workspace'), 'Personal workspace', '#3b82f6', TRUE, id, NOW(), NOW()
FROM users
WHERE id NOT IN (SELECT created_by FROM teams WHERE is_personal = TRUE);

-- Step 5: For every existing user, insert into team_members
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT t.team_id, u.id, 'TEAM_ADMIN', NOW()
FROM teams t
JOIN users u ON t.created_by = u.id
WHERE t.is_personal = TRUE
AND NOT EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = t.team_id AND tm.user_id = u.id);

-- Step 6: Assign all existing boards to the very first user's personal team or their creator's personal team if it exists. Since board doesn't have created_by, assign to first user's personal team for boards with null team_id
UPDATE boards b
SET team_id = (SELECT MIN(team_id) FROM teams WHERE is_personal = TRUE)
WHERE b.team_id IS NULL;

-- Step 7 & 8: ALTER TABLE boards MODIFY COLUMN team_id BIGINT NOT NULL
ALTER TABLE boards MODIFY COLUMN team_id BIGINT NOT NULL;
-- Hibernate might have already added the foreign key, so we don't need to add it if it's there. 

COMMIT;
