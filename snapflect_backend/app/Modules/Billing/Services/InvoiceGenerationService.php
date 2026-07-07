<?php

declare(strict_types=1);

namespace App\Modules\Billing\Services;

use App\Modules\Billing\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InvoiceGenerationService
{
    /**
     * Generates a raw PDF 1.4 byte string for the given invoice.
     */
    public function generatePdfBytes(Invoice $invoice): string
    {
        $organizationName = DB::table('organizations')->where('id', $invoice->organization_id)->value('name') ?? 'Unknown Organization';
        $systemName = 'Snapflect Assessment Portal';
        
        $lines = [
            $systemName,
            "--------------------------------------------------",
            "INVOICE",
            "",
            "Billed To: " . $organizationName,
            "Invoice Number: " . $invoice->invoice_number,
            "Date Issued: " . Carbon::parse($invoice->created_date)->format('F j, Y'),
            "Due Date: " . ($invoice->due_date ? Carbon::parse($invoice->due_date)->format('F j, Y') : 'N/A'),
            "",
            "Status: " . $invoice->status,
            "",
            "Amount Due: USD " . number_format((float)$invoice->amount_due, 2),
            "Amount Paid: USD " . number_format((float)$invoice->amount_paid, 2),
            "",
            "--------------------------------------------------",
            "Thank you for your business!"
        ];

        // Construct a raw, valid PDF 1.4 document
        $objects = [];
        $objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
        $objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
        $objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";
        $objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>"; // Using Courier for monospaced table-like alignment

        $stream = "BT\n/F1 14 Tf\n";
        $y = 720;
        foreach ($lines as $line) {
            $safeLine = strtr($line, ['(' => '\\(', ')' => '\\)', '\\' => '\\\\']);
            $stream .= "50 $y Td\n($safeLine) Tj\n-50 -$y Td\n";
            $y -= 20;
        }
        $stream .= "ET";
        
        $objects[4] = "<< /Length " . strlen($stream) . " >>\nstream\n" . $stream . "\nendstream";

        $out = "%PDF-1.4\n";
        $xrefs = [];
        $offset = strlen($out);
        $xrefs[0] = "0000000000 65535 f \n";
        for ($i = 1; $i <= 5; $i++) {
            $xrefs[$i] = sprintf("%010d 00000 n \n", $offset);
            $obj = "$i 0 obj\n" . $objects[$i] . "\nendobj\n";
            $out .= $obj;
            $offset += strlen($obj);
        }
        $xrefStart = $offset;
        $out .= "xref\n0 6\n";
        foreach ($xrefs as $x) {
            $out .= $x;
        }
        $out .= "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n$xrefStart\n%%EOF\n";

        return $out;
    }
}
