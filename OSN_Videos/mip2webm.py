import os
import numpy as np
import tifffile as tiff
import imageio
from skimage import exposure
from concurrent.futures import ProcessPoolExecutor

def pad_to_16(image):
    """Pad the image dimensions to be divisible by 16."""
    pad_h = (16 - image.shape[0] % 16) % 16
    pad_w = (16 - image.shape[1] % 16) % 16
    return np.pad(image, ((0, pad_h), (0, pad_w)), mode="constant")


def rescale_to_8bit(channel, lower_percentile=1, upper_percentile=99):
    """Scale the input channel to 8-bit using percentile-based contrast adjustment."""
    lower_bound = np.percentile(channel, lower_percentile)
    upper_bound = np.percentile(channel, upper_percentile)

    # Clip values to the percentile range and rescale to 8-bit
    np.clip(channel, lower_bound, upper_bound, out=channel)
    return exposure.rescale_intensity(
        channel, in_range=(lower_bound, upper_bound), out_range=(0, 255)
    ).astype(np.uint8)


def process_and_save_webm(input_path, output_path):
    """Process a TIFF stack and save it as a webm video."""
    try:
        # Attempt to read the TIFF file
        image_stack = tiff.imread(input_path)
    except tiff.TiffFileError:
        print(f"Skipping {input_path}: Not a valid TIFF file.")
        return
    except Exception as e:
        print(f"Skipping {input_path}: Unexpected error while reading the file ({e}).")
        return

    try:
        # Validate TIFF shape and time points
        if image_stack.ndim not in [3, 4]:
            print(f"Skipping {input_path}: Invalid TIFF shape {image_stack.shape}.")
            return

        if image_stack.ndim == 3:
            t, y, x = image_stack.shape
            c = 1
        else:
            t, c, y, x = image_stack.shape

        if t < 10:  # Skip files with fewer than 10 time points
            print(f"Skipping {input_path}: Only {t} time points (minimum required: 10).")
            return

        video_frames = []

        # Process each timepoint
        for _, frame in enumerate(image_stack):
            if c == 1:  # Single-channel case
                channel = frame.astype(np.float32)
                channel = rescale_to_8bit(channel)
                channel = pad_to_16(channel)
                video_frames.append(channel)
            else:  # Multi-channel case
                frame_output = []
                for c_idx in range(frame.shape[0]):  # Process each channel
                    channel = frame[c_idx, :, :].astype(np.float32)
                    channel = rescale_to_8bit(channel)
                    channel = pad_to_16(channel)
                    frame_output.append(channel)

                # Combine channels into a single frame
                if c == 2:  # Two-channel case (Green/Magenta mapping)
                    combined_frame = np.stack(
                        (
                            frame_output[0],  # Magenta (R)
                            frame_output[1],  # Green (G)
                            frame_output[0],  # Magenta (R)
                        ),
                        axis=-1,
                    )
                else:  # More than two channels
                    combined_frame = np.stack(
                        frame_output, axis=-1
                    )  # Use all channels as-is
                video_frames.append(combined_frame)

        # Save the frames as a .webm video
        with imageio.get_writer(
            output_path,
            fps=12,
            format="FFMPEG",
            codec="libvpx-vp9",
            bitrate="10M",
            quality=10,
            pixelformat="yuv420p",
        ) as writer:
            for frame in video_frames:
                writer.append_data(frame)
    except Exception as e:
        print(f"Error processing {input_path}: {e}")


def process_tiff_file(args):
    """Wrapper function for multiprocessing to process a single TIFF file."""
    input_path, output_path = args
    try:
        print(f"Processing...: {input_path}")
        process_and_save_webm(input_path, output_path)
    except Exception as e:
        print(f"Unexpected error while processing {input_path}: {e}")


def find_and_process_tiffs(base_directory, output_directory):
    """Recursively find TIFFs in MIPs folders and process them into webm videos with multiprocessing."""
    if not os.path.exists(output_directory):
        os.makedirs(output_directory)

    # Collect all .tif files in MIPs folders
    tiff_files = []
    for root, _, files in os.walk(base_directory):
        if "MIPs" in root:  # Only process files in MIPs folders
            for file in files:
                if file.endswith(".tif"):
                    input_path = os.path.join(root, file)

                    # Use full path for output filename (replace os.sep with '__')
                    safe_path = input_path.replace(os.sep, "__")
                    safe_path = safe_path.replace(":", "")
                    output_file = safe_path.replace(".tif", ".webm")

                    output_path = os.path.join(output_directory, output_file)
                    tiff_files.append((input_path, output_path))

    # Check existing output files
    tiff_files_to_process = [
        (input_path, output_path)
        for input_path, output_path in tiff_files
        if not os.path.exists(output_path)
    ]

    print(f"{len(tiff_files_to_process)} of {len(tiff_files)} files will be processed.")

    # Use multiprocessing to process files in parallel
    with ProcessPoolExecutor() as executor:
        executor.map(process_tiff_file, tiff_files_to_process)


if __name__ == "__main__":
    base_directory = input(
        "Enter the base directory to search for MIPs folders: "
    ).strip()
    output_directory = input("Enter the directory to save webm files: ").strip()
    find_and_process_tiffs(base_directory, output_directory)
    print("Processing complete!")