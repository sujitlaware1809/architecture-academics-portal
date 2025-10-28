@echo off
echo Creating deploy_1.pem file...
echo.

(
echo -----BEGIN RSA PRIVATE KEY-----
echo MIIEowIBAAKCAQEAr/QiPAPLiDgWEOQuqvHOO1RBcnsSUJRx3M5/EGSO5l8M7gED
echo kqHXy+wlvRueG5j96cimVP7E1TCs12HnUKUcJ4cG/Vox0wXf2LeGqZXWqB7FYVkh
echo ykzAnWZMOgMQ+Jc473ytt9Cqeigr2iN9meik4oCrP5cixGuDv7ak/xb6Ef/KccfE
echo slXPN3SlOO1QmwjJg5bNN6k0jHwqdeqRK1Dr7GI+y/ew4ZrXBm2oO2dlmit48+WT
echo wSH4Mi3DAaDhzLN5gpHZ3t2Ljj81VBtKp3hJQaR6kNfi5BvQTc9/DEd6eTR+gInI
echo ORw4wKGaCSPYolHFS9ZOPppCzq/BNd7ELJT9HQIDAQABAoIBADgZT1zxHNBmiWqD
echo RfnMtKMn3uIAKTu1yIPM9qgkV4dNoNK1Ug1LOoFS3kln58YGxlXmWlnZDKqoJUNa
echo fKSyr8JOg8T9H8uXIOJ4yR+CnXjmrqm2AFb+l57XgdAxMBUCKe35Q23Kwr/F1Q1s
echo qVwL1547xd21cylK2iuisQJ/seVQsEOoqTi88R/br5c5U/Rd0siQ5nwBMuHrKWTy
echo TitwkVnM767M+fSelwQjL+gfNTPRnzBunerInmGYTiLIw+YnRBRz0jWO3lwQigEK
echo 7LBnrBr4mrm5FchFl7WWgGtAKESVNb2hvwx8IE5lZ6Elj+LcTMq80I7otlr+wUBg
echo O3iy8aECgYEA1s8xDDyXCp3vbF87RgUkkoJjW9nVnXJ8zyii+njjQX8klhK9Cke+
echo JvcULaBxq4vwmKbClbuqF0yg4vvGJl4+7gQnlwb0ZWN7xNnNcoxPuvS+70swBkWg
echo AdY1rquc+iS+UpQS1ESsfBiEu7DSFZ3PmtJQv7KQEqn86oz+P4gEsGUCgYEA0bGM
echo jZYTVMSvgnKZHn+ST2fGvq0WPbYiD93akkCy4NtOkqMLno58W1exizolL5921gig
echo muM+HAuh7Uc01dW/Y0ygEAfjOGLdiONpn0QpGdb6Lf7hN92ZlzjO4EuvGgGx/ipX
echo msvOvUy0w+Yko2QFTO0Vu0szRvKJ4+PTkeZpYlkCgYBLHwQxGlNcBCWBycAJ2ayT
echo jAPBUGnS+QHK1JRCcdpPwm4CCaWQncxTBh9JYY2/B15plBACmzF9mm+9UX1XV6g8
echo RrmtqGH5vxO+oMinYYhUgljviGTQHLM7UTVO03c/R3BDosL+9tE3SL/Kf6jIpHrA
echo 0wIoOAMIc+geApa7kw7IvQKBgQChxDTH7WTQWkODgOC69HNsqoRaCLFFvkIct2us
echo tBjK+qRs3zdRhF5PISGoZJzXVk+Y4mLz2ibJ//dVUz9hT1osQqqgc1VI5Iw+1CFh
echo anXCp2OtJBmevWeFj5+YzQoyJ+imSQf4NQ4yXwB8uAi/u6OTKrs/F85hBy51Dgbj
echo YTsfUQKBgGnMBSdzm8eKrzMcz4OzZDdPEJX3af2NniG/VIediqkKLDPo0TUYKYMu
echo dvGTx3VmSSLLpp/8UNbUocOO06qfcgx0oH7e/fLfi8qkMd3G+IzJag90qFRWqFcS
echo 7ufZOvGK8Aofw6RePzd7bu+0GoixDBrCvMV0CmH1yl5XztFXaM+J
echo -----END RSA PRIVATE KEY-----
) > deploy_1.pem

echo.
echo ✅ deploy_1.pem created successfully!
echo.
echo To use it:
echo   ssh -i deploy_1.pem ubuntu@52.66.127.84
echo.
echo ⚠️  IMPORTANT: Keep this file secure and never commit it to Git!
echo.
pause
