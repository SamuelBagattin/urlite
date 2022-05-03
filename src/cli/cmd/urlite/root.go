/*
Copyright © 2020 NAME HERE <EMAIL ADDRESS>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package urlite

import (
	"errors"
	"fmt"
	"github.com/samuelbagattin/urlite/src/cli/pkg"
	"github.com/spf13/cobra"
	"os"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:     "urlite [url]",
	Example: "urlite www.google.com",
	Version: "1",
	Short:   "A brief description of your application",
	Long: `URLite is an open-source cross platform url shortener.
This CLI is a tool to generate short url from any url
The resulting short url will redirect any user to the base url`,
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {
			return errors.New("requires a color argument")
		}
		if pkg.IsValidURL(args[0]) {
			return nil
		}
		return fmt.Errorf("invalid http(s) url specified: %s", args[0])
	},
	// Uncomment the following line if your bare application
	// has an action associated with it:
	RunE: func(cmd *cobra.Command, args []string) error {
		result, err := pkg.GetShortUrl(args[0])
		if err != nil {
			return err
		}
		fmt.Println((*result).ShortUrl)
		return nil
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().BoolVar(&pkg.DisplayStackTrace, "stacktrace", false, "show stacktrace")
}
