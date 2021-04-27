# This script will copy lambda source files into the lib output folder.
# This should be run with the build to ensure that references to lambda code works in the published npm package.
# It uses the pattern src/edge-lambdas/**/src, and copies everything under the lambda's src folder.

files_list=`find "src/edge-lambdas" -type d -name "src" -exec find "{}" -type f -name "*" \;`
for path in $files_list; do
  # Changes the root folder "src" to "lib"
  target_path="${path/src/lib}"
  mkdir -p "$(dirname "$target_path")" && cp "$path" "$target_path"
done
