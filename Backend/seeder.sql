INSERT INTO user (username, password, joined, color) VALUES ('admin', 'admin', '2021-10-01', 'red');
INSERT INTO user (username, password, joined, color) VALUES ('user', 'user', '2021-10-01', 'green');

INSERT INTO channel (name, created, color) VALUES ('general', '2021-10-01', 'blue');
INSERT INTO channel (name, created, color) VALUES ('random', '2021-10-01', 'yellow');

INSERT INTO message (user_id, channel_id, message, time) VALUES (1, 1, 'Hello World!', '2021-10-01');
INSERT INTO message (user_id, channel_id, message, time) VALUES (1, 1, 'Welcome to the general channel!', '2021-10-01');
INSERT INTO message (user_id, channel_id, message, time) VALUES (2, 1, 'Hello!', '2021-10-01');
