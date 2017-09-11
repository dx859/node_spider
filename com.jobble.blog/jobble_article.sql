/*
Navicat MySQL Data Transfer

Source Server         : aliyun_hk
Source Server Version : 50719
Source Host           : localhost:3389
Source Database       : spider_info

Target Server Type    : MYSQL
Target Server Version : 50719
File Encoding         : 65001

Date: 2017-09-11 10:33:16
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for node_article
-- ----------------------------
DROP TABLE IF EXISTS `jobble_article`;
CREATE TABLE `jobble_article` (
  `url_obj_id` char(32) NOT NULL,
  `title` varchar(200) NOT NULL,
  `create_at` date DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  `front_img_url` varchar(255) DEFAULT NULL,
  `front_img_path` varchar(200) DEFAULT NULL,
  `comment_nums` int(11) DEFAULT NULL,
  `fav_nums` int(11) DEFAULT NULL,
  `praise_nums` int(11) DEFAULT NULL,
  `tags` varchar(100) DEFAULT NULL,
  `category` varchar(16) DEFAULT NULL,
  `content` longtext NOT NULL,
  PRIMARY KEY (`url_obj_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
