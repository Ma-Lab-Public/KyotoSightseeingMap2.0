POI dataset

(1)AOI_data.csv
(aid，pname, poly，center，limition, descri）
;;; limition is the 4-point coordinates determined according to the principle of minimum bounding box.

(2)POI_data.csv
(pid，center_gps, coordinate, photo_counts, matched_aoi, mached_aid）
;;; 1.auth数据暂无, 2.需要调整matched_aoi, mached_aid中对应为空的部分, 3.category需要添加。

(3)AOI-POI.csv
 (pid, matched_aoi, mached_aid)

(4))Img_all_info.csv
(Photo/video identifier, User NSID, Data taken, Photo/video download URL, filename, file_id, score, pid, matched_aoi, matched_aid, loci) 

（5）XH_Piview.csv
(pid, timestamp score_mean, photo_count, score_std) 
;;;每间隔X小时取POI图片的美学打分

(6)  heatmap_time_series.zip ;;; 每间隔10min, 20min, 30min, 1h, 2h, 3h景点图片随时间变化的热图分布hitmap - poi。
     heatmap_2_time_series.zip ;;; 每间隔10min, 20min, 30min, 1h, 2h, 3h景点图片随时间变化的热图分布hitman - grid。
    Kyotoview （time, hitman 1- grid, hitmap 2-poi） ;;; Matrix待补充

(7)Img-text.csv
(Photo identifier, user_ID, place_10, attribute_10, user_ tags）

(8)
Trajectory  (l0 l1 …. lm) 
;;;待补充




