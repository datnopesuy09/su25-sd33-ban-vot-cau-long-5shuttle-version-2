-- Bulk order feature tables
CREATE TABLE IF NOT EXISTS BulkOrderInquiry (
    Id BIGINT PRIMARY KEY AUTO_INCREMENT,
    CustomerName VARCHAR(255),
    CustomerPhone VARCHAR(50),
    CustomerEmail VARCHAR(255),
    CustomerNote VARCHAR(1000),
    ContactMethod VARCHAR(50),
    Status VARCHAR(50),
    AssignedStaff VARCHAR(255),
    TotalQuantity INT,
    TotalValue DECIMAL(18,2),
    ItemCount INT,
    CreatedAt DATETIME,
    UpdatedAt DATETIME
);

CREATE TABLE IF NOT EXISTS BulkOrderInquiryNote (
    Id BIGINT PRIMARY KEY AUTO_INCREMENT,
    InquiryId BIGINT,
    StaffName VARCHAR(255),
    Text VARCHAR(2000),
    CreatedAt DATETIME,
    CONSTRAINT fk_note_inquiry FOREIGN KEY (InquiryId) REFERENCES BulkOrderInquiry(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS BulkOrderQuotation (
    Id BIGINT PRIMARY KEY AUTO_INCREMENT,
    InquiryId BIGINT UNIQUE,
    DiscountPercent INT,
    SubTotal DECIMAL(18,2),
    DiscountAmount DECIMAL(18,2),
    Total DECIMAL(18,2),
    CreatedAt DATETIME,
    CONSTRAINT fk_quotation_inquiry FOREIGN KEY (InquiryId) REFERENCES BulkOrderInquiry(Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS BulkOrderInteraction (
    Id BIGINT PRIMARY KEY AUTO_INCREMENT,
    InquiryId BIGINT,
    Type VARCHAR(100),
    Metadata VARCHAR(2000),
    CreatedAt DATETIME,
    INDEX idx_interaction_inquiry (InquiryId)
);
