CREATE TABLE historical_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    route_id INT NOT NULL,
    bus_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    bus_owner_id INT NOT NULL,
    schedule_date TIMESTAMP NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    image LONGBLOB,
    created_at TIMESTAMP NOT NULL,
    
    INDEX idx_company_name (company_name),
    INDEX idx_bus_owner (bus_owner_id),
    INDEX idx_bus (bus_id),
    INDEX idx_created_at (created_at),
    
    CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5)
);