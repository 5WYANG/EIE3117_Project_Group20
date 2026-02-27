CREATE DATABASE IF NOT EXISTS findit;
USE findit;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) UNIQUE,
  avatar_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('lost', 'found') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  subcategory VARCHAR(80),
  location_text VARCHAR(200) NOT NULL,
  occurred_at DATE NOT NULL,
  reward_amount DECIMAL(10, 2) DEFAULT 0,
  status ENUM('active', 'closed', 'resolved') DEFAULT 'active',
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notice_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id INT NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  sort_order INT DEFAULT 1,
  FOREIGN KEY (notice_id) REFERENCES notices(id)
);

CREATE TABLE IF NOT EXISTS responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notice_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (notice_id) REFERENCES notices(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
