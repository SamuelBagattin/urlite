package pkg

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

var DisplayStackTrace = false

type UrlResult struct {
	ShortUrl  string `json:"shortUrl"`
	TotalUrls int    `json:"totalUrls"`
}

func GetShortUrl(url string) (*UrlResult, error) {
	jsonStr := []byte(fmt.Sprintf(`{"url":"%s"}`, url))
	req, err := http.NewRequest("POST", "https://urlite.samuelbagattin.com/urls", bytes.NewBuffer(jsonStr))
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		if DisplayStackTrace {
			panic(err)
		}
		return nil, err
	}

	body, bodyErr := ioutil.ReadAll(resp.Body)
	if bodyErr != nil {
		if DisplayStackTrace {
			panic(bodyErr)
		}
		return nil, nil
	}
	var objectResult UrlResult
	err = json.Unmarshal(body, &objectResult)
	if err != nil {
		if DisplayStackTrace {
			panic(err)
		}
		return nil, err
	}
	err = resp.Body.Close()
	if err != nil {
		if DisplayStackTrace {
			panic(err)
		}
		return nil, err
	}
	return &objectResult, nil
}
