#!/bin/bash

# Configuration
SOURCE_DIR="/Users/demon/vibecoding/wayon/docs/外贸出口资料"
TARGET_DIR="/Users/demon/vibecoding/wayon/docs/外贸出口资料_压缩版"

# Create target directory
mkdir -p "$TARGET_DIR"

# Find all common video formats
# Using find with case-insensitive matches for mp4, mov, mkv, avi
echo "Starting video compression using Apple hardware acceleration (h264_videotoolbox)..."
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"
echo "----------------------------------------------------"

find "$SOURCE_DIR" -type f \( -iname \*.mp4 -o -iname \*.mov -o -iname \*.mkv -o -iname \*.avi \) | while read -r FILE; do
    # Get the relative path of the file from the source dir
    REL_PATH="${FILE#$SOURCE_DIR/}"
    
    # Target file path (change extension to .mp4)
    TARGET_FILE="$TARGET_DIR/${REL_PATH%.*}.mp4"
    
    # Target directory for this specific file
    TARGET_FILE_DIR=$(dirname "$TARGET_FILE")
    
    # Create the directory structure in the target folder
    mkdir -p "$TARGET_FILE_DIR"
    
    # Skip if target file already exists
    if [ -f "$TARGET_FILE" ]; then
        echo "⏭️  Skipping (Already exists): $REL_PATH"
        continue
    fi
    
    echo "🔄 Compressing: $REL_PATH"
    
    # Run FFmpeg using Apple Silicon VideoToolbox
    # -c:v h264_videotoolbox: Hardware acceleration for blazing speed
    # -b:v 2000k: Cap bitrate at 2Mbps (good for web videos). Modify as needed.
    # -preset faster / -movflags +faststart : Web optimization (starts playing immediately)
    
    ffmpeg -nostdin -i "$FILE" \
        -c:v h264_videotoolbox -b:v 2000k \
        -c:a aac -b:a 128k \
        -movflags +faststart \
        -loglevel error -y -stats \
        "$TARGET_FILE"
        
    echo "✅ Finished: $REL_PATH"
    echo "----------------------------------------------------"
done

echo "🎉 All videos have been compressed!"
