package utils

import (
	"bufio"
	"fmt"
	"io"
	"os"
)

func Backup(file string, x io.WriterTo) {
	fmt.Printf("Saving %s\n", file)
	f, err := os.Create(file)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	w := bufio.NewWriter(f)
	_, err = x.WriteTo(w)
	if err != nil {
		panic(err)
	}
	w.Flush()
}

func Restore(file string) *os.File {
	fmt.Printf("Opening %s\n", file)
	f, err := os.OpenFile(file, os.O_RDONLY, os.ModePerm)
	if err != nil {
		panic(err)
	}
	return f
}
