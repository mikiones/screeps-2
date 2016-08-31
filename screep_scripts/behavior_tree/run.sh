#!/bin/bash

docker run -it --rm -v $(pwd):/app --workdir=/app node node index.js
