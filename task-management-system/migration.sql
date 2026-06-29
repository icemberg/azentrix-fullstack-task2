START TRANSACTION;

-- Step 1: Create teams table
CREATE TABLE teams (
    team_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(300),
    avatar_color VARCHAR(7) NOT NULL,
    is_personal BOOLEAN DEFAULT FALSE,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Step 2: Create team_members table  
CREATE TABLE team_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT,
    user_id BIGINT,
    role VARCHAR(20),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(team_id, user_id)
);

-- Step 3: Create team_invitations table
CREATE TABLE team_invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT,
    invited_by BIGINT,
    invited_email VARCHAR(255) NOT NULL,
    token VARCHAR(128) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'TEAM_MEMBER',
    status VARCHAR(20),
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Step 4: For every existing user, create a personal team
INSERT INTO teams (name, description, avatar_color, is_personal, created_by, created_at, updated_at)
SELECT CONCAT(username, '''s Workspace'), 'Personal workspace', '#3b82f6', TRUE, id, NOW(), NOW()
FROM users;

-- Step 5: For every existing user, insert into team_members
INSERT INTO team_members (team_id, user_id, role, joined_at)
SELECT t.team_id, u.id, 'TEAM_ADMIN', NOW()
FROM teams t
JOIN users u ON t.created_by = u.id
WHERE t.is_personal = TRUE;

-- Step 6: Add team_id to boards
ALTER TABLE boards ADD COLUMN team_id BIGINT;

-- Assign all existing boards to the very first user's personal team
UPDATE boards SET team_id = (SELECT MIN(team_id) FROM teams WHERE is_personal = TRUE);

-- Step 7 & 8: ALTER TABLE boards MODIFY COLUMN team_id BIGINT NOT NULL
-- Also assign a default value just in case some boards were left out due to no teams existing
ALTER TABLE boards MODIFY COLUMN team_id BIGINT NOT NULL;
ALTER TABLE boards ADD CONSTRAINT fk_boards_teams FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE;

COMMIT;
