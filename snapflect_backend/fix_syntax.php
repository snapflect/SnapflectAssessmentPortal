<?php
$dirs = [
    __DIR__ . '/app/Modules',
    __DIR__ . '/routes/modules',
];

foreach ($dirs as $dir) {
    if (!is_dir($dir)) continue;
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
    foreach ($iterator as $file) {
        if ($file->isFile() && str_ends_with($file->getFilename(), '.php')) {
            $content = file_get_contents($file->getPathname());
            
            // Fix 1: The \n literal issue in imports without 'use '
            $lines = explode(PHP_EOL, $content);
            $modified = false;
            
            foreach ($lines as $i => &$line) {
                // If the line contains \n and looks like a list of classes
                if (str_contains($line, ';\n') || str_contains($line, ';\nuse')) {
                    // It could be missing "use " entirely
                    $parts = explode(';\n', $line);
                    $newLines = [];
                    foreach ($parts as $part) {
                        $part = trim($part);
                        if (empty($part)) continue;
                        if (!str_starts_with($part, 'use ')) {
                            $part = 'use ' . $part;
                        }
                        if (!str_ends_with($part, ';')) {
                            $part .= ';';
                        }
                        $newLines[] = $part;
                    }
                    $line = implode(PHP_EOL, $newLines);
                    $modified = true;
                }
            }
            
            if ($modified) {
                $newContent = implode(PHP_EOL, $lines);
                file_put_contents($file->getPathname(), $newContent);
                echo "Fixed: " . $file->getPathname() . "\n";
            }
        }
    }
}
echo "Done.\n";
