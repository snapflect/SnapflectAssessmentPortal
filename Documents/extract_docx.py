import zipfile
import xml.etree.ElementTree as ET
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as archive:
            xml_content = archive.read('word/document.xml')
            root = ET.fromstring(xml_content)
            # Find all text elements
            texts = []
            for node in root.iter():
                if node.tag.endswith('}t') and node.text:
                    texts.append(node.text)
            print(''.join(texts))
    except Exception as e:
        print(f"Error parsing DOCX: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_text_from_docx(sys.argv[1])
