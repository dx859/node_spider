/*
Navicat MySQL Data Transfer

Source Server         : aliyun_hk
Source Server Version : 50719
Source Host           : hk.immooc.xyz:3389
Source Database       : spider

Target Server Type    : MYSQL
Target Server Version : 50719
File Encoding         : 65001

Date: 2017-09-11 18:12:40
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for dd_categorys
-- ----------------------------
DROP TABLE IF EXISTS `dd_categorys`;
CREATE TABLE `dd_categorys` (
  `id` tinyint(3) unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(32) NOT NULL COMMENT '小说类型',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小说分类表';

-- ----------------------------
-- Table structure for dd_chapters
-- ----------------------------
DROP TABLE IF EXISTS `dd_chapters`;
CREATE TABLE `dd_chapters` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `novels_id` smallint(6) NOT NULL COMMENT '小说id',
  `title` varchar(64) NOT NULL DEFAULT '' COMMENT '章节名',
  `chapter_index` smallint(6) NOT NULL COMMENT '章节排序',
  `word_count` mediumint(9) unsigned NOT NULL DEFAULT '0' COMMENT '章节字数',
  `url` varchar(64) NOT NULL COMMENT '来源url',
  `is_spider` tinyint(4) unsigned NOT NULL DEFAULT '0' COMMENT '是否爬取，0表示没有，1表示爬取',
  `update_at` date DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `url_unique` (`url`),
  KEY `novels_id_key` (`novels_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='章节表';

-- ----------------------------
-- Table structure for dd_contents
-- ----------------------------
DROP TABLE IF EXISTS `dd_contents`;
CREATE TABLE `dd_contents` (
  `chapter_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `content` longtext,
  PRIMARY KEY (`chapter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=COMPRESSED COMMENT='章节内容表';

-- ----------------------------
-- Table structure for dd_novels
-- ----------------------------
DROP TABLE IF EXISTS `dd_novels`;
CREATE TABLE `dd_novels` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL DEFAULT '' COMMENT '小说名',
  `author` varchar(32) DEFAULT NULL COMMENT '小说作者',
  `intro` text COMMENT '小说简介',
  `url` varchar(64) NOT NULL,
  `image_path` varchar(64) DEFAULT NULL,
  `image_url` varchar(64) DEFAULT NULL COMMENT '小说封面图片',
  `category_name` varchar(32) DEFAULT NULL COMMENT '分类',
  `word_count` int(11) DEFAULT NULL,
  `status` varchar(16) DEFAULT NULL,
  `update_at` varchar(32) DEFAULT NULL COMMENT '小说最后跟新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `url_unique` (`url`),
  KEY `name_key` (`name`),
  KEY `author_key` (`author`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小说表';
