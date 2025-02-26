package utils

import (
	"bytes"
	"encoding/binary"
)

func structToBytes(s any) ([]byte, error) {
	buf := new(bytes.Buffer)
	err := binary.Write(buf, binary.LittleEndian, s) // or BigEndian
	if err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
