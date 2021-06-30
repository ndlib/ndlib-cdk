#!/bin/sh
# This script will copy lambda "src" folders into the lib output folder.
# This should be run with the build to ensure that references to lambda code works in the published npm package.
# It uses the pattern src/(edge|internal)-lambdas/**/src, and copies everything in the src directory.

dir_list=`find "src/edge-lambdas" "src/internal-lambdas" -type d -regex ".*-lambdas/[^/\]*/src"`
for dir in $dir_list; do
  # Changes the root folder "src" to "lib"
  target_path=$(printf "%s" "$dir" | sed -e 's@src@lib@')
  mkdir -p "$(dirname "$target_path")" && cp -R "$dir/." "$target_path"
done
