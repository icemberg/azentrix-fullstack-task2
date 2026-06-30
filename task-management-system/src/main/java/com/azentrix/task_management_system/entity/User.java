package com.azentrix.task_management_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Long userId;

	@Column(nullable = false, unique = true)
	private String username;

	@Column(unique = true, nullable = false)
	private String email;

	@Column(nullable = false)
	private String password;

	@Column(columnDefinition = "LONGTEXT")
	private String avatar;

	@Column(name = "theme")
	private String theme = "dark";

	@Column(name = "default_view")
	private String defaultView = "kanban";

	@Column(name = "start_of_week")
	private String startOfWeek = "monday";

	@Column(name = "email_mentions")
	private Boolean emailMentions = true;

	@Column(name = "email_assignments")
	private Boolean emailAssignments = true;

	@Column(name = "push_due_reminders")
	private Boolean pushDueReminders = true;

	@Column(name = "push_board_updates")
	private Boolean pushBoardUpdates = false;

	@Column(name = "two_factor_enabled")
	private Boolean twoFactorEnabled = false;

	@Column(name = "two_factor_secret")
	private String twoFactorSecret;

	@Column(name = "auth_provider")
	private String authProvider = "LOCAL";

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "role_id", nullable = false)
	private Role role;

}
