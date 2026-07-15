import zipfile
import xml.etree.ElementTree as ET
import os
import sys

def extract_text_from_pptx(pptx_path, out_path):
    if not os.path.exists(pptx_path):
        print(f"File not found: {pptx_path}")
        return

    try:
        with open(out_path, 'w', encoding='utf-8') as f:
            with zipfile.ZipFile(pptx_path, 'r') as archive:
                slides = [name for name in archive.namelist() if name.startswith('ppt/slides/slide') and name.endswith('.xml')]
                slides.sort(key=lambda x: int(''.join(filter(str.isdigit, x))))
                
                for slide in slides:
                    f.write(f"--- {slide} ---\n")
                    xml_content = archive.read(slide)
                    root = ET.fromstring(xml_content)
                    ns = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}
                    
                    texts = []
                    for node in root.findall('.//a:t', ns):
                        if node.text:
                            texts.append(node.text)
                    
                    if texts:
                        f.write('\n'.join(texts) + '\n')
                    else:
                        f.write("[No text found on this slide]\n")
                    f.write("\n")
        print("Done")
    except Exception as e:
        print(f"Error parsing PPTX: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_text_from_pptx(sys.argv[1], "pptx_out.txt")
    else:
        print("Please provide a path to a PPTX file.")
