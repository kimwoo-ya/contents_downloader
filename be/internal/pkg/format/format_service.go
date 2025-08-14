package format

//func GetAvailableFormats(uri string) (ContentFormat, error) {
//	var contentFormat ContentFormat

//	command := exec.Command("/opt/homebrew/bin/yt-dlp", "--dump-json", uri)
//	if commandOutput, err := command.Output(); err != nil {
//		log.Fatalf("%v", err)
//		return contentFormat, err
//	} else {
//		json.Unmarshal(commandOutput, &contentFormat)
//	}

//	log.Infof("id: %+v", contentFormat.ID)
//	log.Infof("uploader: %+v", contentFormat.Uploader)
//	log.Infof("title: %+v", contentFormat.Title)
//	log.Infof("description: %+v....", contentFormat.Description[:40])
//	log.Infof("thumbnail url: %+v", contentFormat.Thumbnail)
//	contentFormat.FilterFormats("audio")
//	contentFormat.Sort()
//	for _, format := range contentFormat.Formats {
//		fmt.Printf("format_id:\"%+v\", format:\"%+v\", width:%+v, height:%+v, fps:%+v, vbr:%+v, filesize:%+v\n", format.FormatID, format.Format, format.Width, format.Height, format.Fps, format.Vbr, format.Filesize)
//	}
//	fmt.Println()
//	return contentFormat, nil
//}

func GetAvailableFormats(contentFormat ContentFormat) ([]Format, []Thumbnails) {
	//log.Infof("id: %+v", contentFormat.ID)
	//log.Infof("uploader: %+v", contentFormat.Uploader)
	//log.Infof("title: %+v", contentFormat.Title)
	//log.Infof("description: %+v....", contentFormat.Description[:40])
	//log.Infof("thumbnail url: %+v", contentFormat.Thumbnail)
	contentFormat.FilterFormats("audio")
	contentFormat.Sort()
	//for _, format := range contentFormat.Formats {
	//	fmt.Printf("format_id:\"%+v\", format:\"%+v\", width:%+v, height:%+v, fps:%+v, vbr:%+v, filesize:%+v\n", format.FormatID, format.Format, format.Width, format.Height, format.Fps, format.Vbr, format.Filesize)
	//}
	//fmt.Println()
	return contentFormat.Formats, contentFormat.Thumbnails
}
