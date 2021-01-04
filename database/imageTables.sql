
CREATE TABLE images (
    backendID uniqueidentifier NOT NULL
        DEFAULT newid(),
    frontendID VARCHAR(25) NOT NULL,
    baseimg VARCHAR(255)NOT NULL,
    imgdate datetime NOT NULL
        DEFAULT getdate(),
)

INSERT INTO images (frontendID, baseimg) 
    VALUES (1234, 'the path is here');

SELECT baseimg FROM images WHERE frontendID='1234561234';

DROP TABLE images;