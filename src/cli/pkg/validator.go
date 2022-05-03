package pkg

import "regexp"

const httpURLRegex = `^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$`

func IsValidURL(url string) bool {
	result, _ := regexp.Match(httpURLRegex, []byte(url))
	return result
}
