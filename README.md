# Load_Performance_Testing_OrangeToolz
OrangeToolz_LoadTesting_Jmeter

Dear viewers, 

I’ve completed performance test on frequently used API for test App. 
Test executed for the below mentioned scenario in server 000.000.000.00. 

800 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is ~ 77.01 And Total Concurrent API requested: 7928 Error Rate  1.17%.

900 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is ~ 85.63  And Total Concurrent API requested: 8930 Error Rate  1.2%.

1000 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is ~ 80.86 And Total Concurrent API requested: 8500 Error Rate  0.76% .

1100 current Request with 1 Loop Count; Avg TPS for Total Samples is ~ 64.69 And Total Concurrent API requested: 10560 Error Rate  10.11%.

1200 Concurrent Request with 1 Loop Count; Avg TPS for Total Samples is ~ 79.15 And Total Concurrent API requested: 6800 Error Rate  11.66% .

While executed 1200 concurrent request, found  1333 request got per 60 sec connection timeout and error rate is 11.66%. 

Summary: Server can handle almost concurrent 9968 API call with almost zero (0) error rate.

Please find the details report from the attachment and  let me know if you have any further queries. 
