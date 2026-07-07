<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate of Completion</title>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Great+Vibes&family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #e0e5ec;
            font-family: 'Montserrat', sans-serif;
            min-height: 100vh;
        }
        .certificate {
            width: 1122px;
            height: 794px;
            background-color: #ffffff;
            background-image: radial-gradient(#f8f9fa 1px, transparent 1px);
            background-size: 20px 20px;
            padding: 30px;
            position: relative;
            box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }
        .border-outer {
            width: 100%;
            height: 100%;
            border: 2px solid #d4af37;
            padding: 8px;
        }
        .border-inner {
            width: 100%;
            height: 100%;
            border: 12px solid #0f204b;
            background-color: rgba(255, 255, 255, 0.96);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 60px;
            position: relative;
        }
        .corner-decoration {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 4px solid #d4af37;
        }
        .top-left { top: -16px; left: -16px; border-right: none; border-bottom: none; }
        .top-right { top: -16px; right: -16px; border-left: none; border-bottom: none; }
        .bottom-left { bottom: -16px; left: -16px; border-right: none; border-top: none; }
        .bottom-right { bottom: -16px; right: -16px; border-left: none; border-top: none; }

        .header-logo {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #0f204b, #1a367d);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 25px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .header-logo span {
            color: #d4af37;
            font-family: 'Cinzel', serif;
            font-size: 32px;
            font-weight: 700;
        }
        h1.title {
            font-family: 'Cinzel', serif;
            font-size: 48px;
            color: #0f204b;
            text-transform: uppercase;
            letter-spacing: 5px;
            margin-bottom: 15px;
        }
        .subtitle {
            font-size: 16px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 35px;
        }
        .intro-text {
            font-size: 18px;
            color: #444;
            margin-bottom: 15px;
        }
        .candidate-name {
            font-family: 'Cinzel', serif;
            font-size: 60px;
            color: #0f204b;
            margin-bottom: 15px;
            padding: 0 50px 10px 50px;
            border-bottom: 2px solid #d4af37;
            line-height: 1.1;
            min-width: 60%;
            text-align: center;
        }
        .reason-text {
            font-size: 16px;
            color: #555;
            margin-bottom: 20px;
        }
        .assessment-name {
            font-family: 'Cinzel', serif;
            font-size: 30px;
            color: #0f204b;
            font-weight: 700;
            margin-bottom: 15px;
            text-align: center;
        }
        .score-container {
            font-size: 18px;
            color: #444;
            margin-bottom: 40px;
        }
        .score-value {
            color: #d4af37;
            font-weight: 600;
            font-size: 22px;
        }
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            width: 100%;
            margin-top: auto;
            padding: 0 40px;
        }
        .signature-box {
            text-align: center;
            width: 220px;
        }
        .signature-line {
            border-bottom: 1px solid #0f204b;
            height: 40px;
            margin-bottom: 10px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
        }
        .signature-font {
            font-family: 'Great Vibes', cursive;
            font-size: 32px;
            color: #0f204b;
            line-height: 0.8;
        }
        .signature-label {
            font-size: 13px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 500;
        }
        .date-val {
            font-family: 'Montserrat', sans-serif;
            font-size: 18px;
            color: #333;
            font-weight: 500;
            line-height: 1;
            padding-bottom: 5px;
        }
        .seal {
            width: 130px;
            height: 130px;
            background: linear-gradient(135deg, #d4af37, #f3e5ab, #d4af37);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            position: relative;
        }
        .seal-inner {
            width: 110px;
            height: 110px;
            border: 2px dashed #0f204b;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            background: rgba(255,255,255,0.1);
        }
        .seal-text {
            color: #0f204b;
            font-family: 'Cinzel', serif;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            line-height: 1.4;
        }
        
        @media print {
            body {
                background-color: #ffffff;
                margin: 0;
                padding: 0;
            }
            .certificate {
                box-shadow: none;
                width: 100%;
                height: 100%;
                padding: 10px;
            }
        }
    </style>
    <script>
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    </script>
</head>
<body>
    <div class="certificate">
        <div class="border-outer">
            <div class="border-inner">
                <div class="corner-decoration top-left"></div>
                <div class="corner-decoration top-right"></div>
                <div class="corner-decoration bottom-left"></div>
                <div class="corner-decoration bottom-right"></div>
                
                <div class="header-logo">
                    <span>S</span>
                </div>

                <h1 class="title">Certificate of Completion</h1>
                <div class="subtitle">Awarded for Excellence & Dedication</div>

                <div class="intro-text">This is to certify that</div>
                
                <div class="candidate-name">{{ $candidateName }}</div>
                
                <div class="reason-text">has successfully completed the assessment</div>
                
                <div class="assessment-name">{{ $assessmentName }}</div>
                
                <div class="score-container">
                    Achieved Score: <span class="score-value">{{ $score }}%</span>
                </div>

                <div class="footer">
                    <div class="signature-box">
                        <div class="signature-line">
                            <span class="date-val">{{ $date }}</span>
                        </div>
                        <div class="signature-label">Date of Issue</div>
                    </div>

                    <div class="seal">
                        <div class="seal-inner">
                            <div class="seal-text">OFFICIAL<br>CERTIFIED<br>ACHIEVEMENT</div>
                        </div>
                    </div>

                    <div class="signature-box">
                        <div class="signature-line">
                            <span class="signature-font">SnapFlect</span>
                        </div>
                        <div class="signature-label">Program Director</div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</body>
</html>
