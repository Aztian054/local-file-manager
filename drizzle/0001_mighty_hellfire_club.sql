CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` bigint NOT NULL,
	`category` enum('Dokumen','Foto','Video','Audio','Arsip','Aplikasi','ISO','Lainnya') NOT NULL,
	`storagePath` text NOT NULL,
	`fileKey` varchar(500) NOT NULL,
	`uploadYear` int NOT NULL,
	`uploadMonth` int NOT NULL,
	`uploadMonthName` varchar(20) NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
