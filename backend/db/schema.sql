CREATE TABLE properties (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  timezone VARCHAR(64) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  property_id BIGINT NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone_number VARCHAR(32) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'resident', 'staff') NOT NULL DEFAULT 'resident',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_property FOREIGN KEY (property_id) REFERENCES properties (id)
);

CREATE TABLE doors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  property_id BIGINT NOT NULL,
  name VARCHAR(120) NOT NULL,
  location_hint VARCHAR(255),
  relay_url VARCHAR(512) NOT NULL,
  relay_token VARCHAR(255),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_doors_property FOREIGN KEY (property_id) REFERENCES properties (id)
);

CREATE TABLE user_door_permissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  door_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_door (user_id, door_id),
  CONSTRAINT fk_udp_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_udp_door FOREIGN KEY (door_id) REFERENCES doors (id)
);

CREATE TABLE guest_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  property_id BIGINT NOT NULL,
  door_id BIGINT NOT NULL,
  created_by_user_id BIGINT NOT NULL,
  code VARCHAR(32) NOT NULL,
  expires_at DATETIME NOT NULL,
  uses INT NOT NULL DEFAULT 0,
  is_revoked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_guest_code_lookup (code, door_id, expires_at),
  CONSTRAINT fk_guest_property FOREIGN KEY (property_id) REFERENCES properties (id),
  CONSTRAINT fk_guest_door FOREIGN KEY (door_id) REFERENCES doors (id),
  CONSTRAINT fk_guest_creator FOREIGN KEY (created_by_user_id) REFERENCES users (id)
);

CREATE TABLE access_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  property_id BIGINT NOT NULL,
  door_id BIGINT NOT NULL,
  actor_type ENUM('user', 'guest', 'phone') NOT NULL,
  actor_id BIGINT NULL,
  channel ENUM('app', 'qr', 'phone', 'pin') NOT NULL,
  status ENUM('granted', 'denied', 'error') NOT NULL,
  reason VARCHAR(120),
  source_phone VARCHAR(32),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_access_property_time (property_id, created_at),
  INDEX idx_access_door_time (door_id, created_at),
  CONSTRAINT fk_logs_property FOREIGN KEY (property_id) REFERENCES properties (id),
  CONSTRAINT fk_logs_door FOREIGN KEY (door_id) REFERENCES doors (id)
);
