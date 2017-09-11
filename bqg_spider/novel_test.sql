/*
Navicat MySQL Data Transfer

Source Server         : aliyun_daixi
Source Server Version : 50719
Source Host           : 47.52.43.111:3389
Source Database       : novel_test

Target Server Type    : MYSQL
Target Server Version : 50719
File Encoding         : 65001

Date: 2017-09-04 10:06:20
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for categorys
-- ----------------------------
DROP TABLE IF EXISTS `categorys`;
CREATE TABLE `categorys` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(32) NOT NULL COMMENT '小说类型',
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_unique` (`category`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COMMENT='小说分类表';

-- ----------------------------
-- Table structure for chapters
-- ----------------------------
DROP TABLE IF EXISTS `chapters`;
CREATE TABLE `chapters` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `novels_id` int(11) NOT NULL COMMENT '小说id',
  `websites_id` tinyint(4) NOT NULL COMMENT '来源网站',
  `title` varchar(64) NOT NULL DEFAULT '' COMMENT '章节名',
  `chapter_index` mediumint(9) NOT NULL COMMENT '章节排序',
  `word_count` mediumint(9) unsigned NOT NULL DEFAULT '0' COMMENT '章节字数',
  `origin_url` varchar(120) NOT NULL COMMENT '来源url',
  `is_spider` tinyint(4) unsigned NOT NULL DEFAULT '0' COMMENT '是否爬取，0表示没有，1表示爬取',
  `create_at` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `update_at` timestamp NULL DEFAULT NULL COMMENT '修改时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `origin_url_unique` (`origin_url`)
) ENGINE=InnoDB AUTO_INCREMENT=237318 DEFAULT CHARSET=utf8mb4 COMMENT='章节表';

-- ----------------------------
-- Table structure for contents
-- ----------------------------
DROP TABLE IF EXISTS `contents`;
CREATE TABLE `contents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content` mediumtext,
  `chapters_id` int(11) unsigned DEFAULT NULL COMMENT 'chapters的外键',
  PRIMARY KEY (`id`),
  KEY `chapters_contents` (`chapters_id`),
  CONSTRAINT `chapters_contents` FOREIGN KEY (`chapters_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=236090 DEFAULT CHARSET=utf8mb4 COMMENT='章节内容表';

-- ----------------------------
-- Table structure for novels
-- ----------------------------
DROP TABLE IF EXISTS `novels`;
CREATE TABLE `novels` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '小说名',
  `author` varchar(32) DEFAULT NULL COMMENT '小说作者',
  `intro` varchar(500) DEFAULT NULL COMMENT '小说简介',
  `cover_img` varchar(255) DEFAULT NULL COMMENT '小说封面图片',
  `category_name` varchar(32) DEFAULT NULL COMMENT '分类',
  `word_count` int(11) DEFAULT NULL,
  `update_at` timestamp NULL DEFAULT NULL COMMENT '小说更新时间',
  `create_at` timestamp NULL DEFAULT NULL COMMENT '小说创建时间',
  `last_update` varchar(32) DEFAULT NULL COMMENT '小说最后跟新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_author` (`name`,`author`)
) ENGINE=InnoDB AUTO_INCREMENT=761 DEFAULT CHARSET=utf8mb4 COMMENT='小说表';

-- ----------------------------
-- Table structure for novels_websites
-- ----------------------------
DROP TABLE IF EXISTS `novels_websites`;
CREATE TABLE `novels_websites` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `novels_id` int(11) NOT NULL COMMENT '小说id',
  `websites_id` tinyint(4) NOT NULL COMMENT '网站id',
  `url` varchar(255) DEFAULT NULL COMMENT '小说在网站的url',
  PRIMARY KEY (`id`),
  UNIQUE KEY `novels_website` (`novels_id`,`websites_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=751 DEFAULT CHARSET=utf8mb4 COMMENT='小说网站关系表';

-- ----------------------------
-- Table structure for websites
-- ----------------------------
DROP TABLE IF EXISTS `websites`;
CREATE TABLE `websites` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) DEFAULT NULL COMMENT '网站名',
  `host` varchar(32) DEFAULT NULL COMMENT '主机名',
  `origin` varchar(64) DEFAULT NULL COMMENT '网站域名',
  PRIMARY KEY (`id`),
  UNIQUE KEY `host_unique` (`host`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COMMENT='网站源';
