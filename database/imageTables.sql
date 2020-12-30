
CREATE TABLE images (
    backendID uniqueidentifier NOT NULL
        DEFAULT newid(),
    frontendID VARCHAR(25) NOT NULL,
    baseimg VARCHAR(max)NOT NULL,
    imgdate datetime NOT NULL
        DEFAULT getdate(),
)


SELECT baseimg FROM images WHERE frontendID='1234561234';