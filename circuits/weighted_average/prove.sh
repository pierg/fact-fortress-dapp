#!/bin/bash
nargo prove p
if [ $? -eq 0 ]; then
	echo "SUCCESS"
else
	echo "FAIL"
fi
