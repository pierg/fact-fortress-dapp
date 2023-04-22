#!/bin/bash
nargo verify p
if [ $? -eq 0 ]; then
	echo "SUCCESS"
else
	echo "FAIL"
fi
