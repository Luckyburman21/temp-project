$undertow.onPost("/gettotalemployeecount",
    { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
    ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {

        try {
            var curr_date = $entity['curr_date'];
            var query = "SELECT COUNT(DISTINCT employee_id) as total_count FROM hls_schema_common.view_total_employee_details where retirement_date > CAST('"+curr_date+"' as DATE)";
            var totalemployeecount = db.select(query);
            var jsonResult = JSON.stringify(totalemployeecount);

            $exchange.send(jsonResult); // Send the result
        } catch (e) {
            var errorResult = JSON.stringify({ success: false, error: e.message });
            $exchange.send(errorResult); // Send error message if something goes wrong
        }
    }]
)

$undertow.onPost("/getpresentemployeecount",
    { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
    ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {

        try {
            var curr_date = $entity['curr_date'];
            var start_time=curr_date + " "+"00:00:00.000";
            var end_time=curr_date + " "+"23:59:59.000";
            var query = "SELECT count(DISTINCT a.employee_id) as present_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d  on c.department_id = d.department_id  INNER JOIN hls_schema_common.tbl_site_details as e on c.site_id = e.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as f on f.employee_id = a.employee_id  WHERE f.punches_disp_purpose != '' and a.employee_type_id = 1 and  f.for_date BETWEEN '" + start_time + "' AND '" + end_time + "'";
            var totalpresentemployee = db.select(query);
            var jsonResult = JSON.stringify(totalpresentemployee);

            $exchange.send(jsonResult); // Send the result
        } catch (e) {
            var errorResult = JSON.stringify({ success: false, error: e.message });
            $exchange.send(errorResult); // Send error message if something goes wrong
        }
    }]
)


$undertow.onPost("/getabsentemployeecount",
    { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
    ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {

        try {
            var curr_date = $entity['curr_date'];
            var start_time=curr_date + " "+"00:00:00.000";
            var end_time=curr_date + " "+"23:59:59.000";
            var query = "SELECT count(DISTINCT a.employee_id) as absent_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d  on c.department_id = d.department_id  INNER JOIN hls_schema_common.tbl_site_details as e on c.site_id = e.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as f on f.employee_id = a.employee_id  WHERE f.punches_disp_purpose = '' and a.employee_type_id = 1 and  f.for_date BETWEEN '" + start_time + "' AND '" + end_time + "'";
            var totalabsentemployee = db.select(query);
            var jsonResult = JSON.stringify(totalabsentemployee);
            $exchange.send(jsonResult); // Send the result
        } catch (e) {
            var errorResult = JSON.stringify({ success: false, error: e.message });
            $exchange.send(errorResult); // Send error message if something goes wrong
        }
    }]
)

$undertow
    .onPost("/gettotalemployee",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var curr_date = $entity['curr_date'];
                var totalemployee = db.select("SELECT employee_id,first_name,middle_name,last_name,designation,department_name,site_name FROM HLS_DB.hls_schema_common.view_total_employee_details where retirement_date > '" + curr_date + "'")
                var jsonResult = JSON.stringify(totalemployee);

                $exchange.send(jsonResult);
            } catch (e) {

                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )


    .onPost("/gettotalpresentemp",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var curr_date = $entity['curr_date'];
                var start_time=curr_date + " "+"00:00:00.000";
                var end_time=curr_date + " "+"23:59:59.000";
                var totalpresentemp = db.select("SELECT DISTINCT a.employee_id,a.first_name,a.middle_name,a.last_name,b.employee_designation_type_name as designation,d.department_name,e.site_name,f.punches_disp_purpose FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d  on c.department_id = d.department_id  INNER JOIN hls_schema_common.tbl_site_details as e on c.site_id = e.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as f on f.employee_id = a.employee_id  WHERE f.punches_disp_purpose != '' and a.employee_type_id = 1 and  f.for_date BETWEEN '" + start_time + "' AND '" + end_time + "'");
                var new_data = totalpresentemp.map(function (obj) {
                    var in_out_time_string = obj.punches_disp_purpose;
                    var entries = in_out_time_string.split(';').map(function (entry) {
                        return entry.trim();
                    }).filter(function (entry) {
                        return entry;
                    });
                
                    var inTimes = [];
                    var outTimes = [];
                
                    entries.forEach(function (entry) {
                        var match = entry.match(/(\d{2}:\d{2}:\d{2}) (\d{2}\/\d{2}\/\d{4})\((I|O)\)/);
                        if (match) {
                            var time = match[1];
                            var date = match[2];
                            var type = match[3];
                
                            if (type === 'I') {
                                inTimes.push(time);
                            } else if (type === 'O') {
                                outTimes.push(time);
                            }
                        }
                    });
                
                    var inTime = inTimes.length > 0 ? inTimes[0] : "-";
                    var outTime = outTimes.length > 0 ? outTimes[outTimes.length - 1] : "-";
                   
                
                    // ES5 doesn't have spread operators, so we manually copy properties.
                    var newObj = {};
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            newObj[key] = obj[key];
                        }
                    }
                    
                    
                    newObj.inTime = inTime;
                    newObj.outTime = outTime;
                
                    return newObj;
                });
                
               
                var jsonResult = JSON.stringify(new_data);
                $exchange.send(jsonResult);
            } catch (e) {

                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )

    .onPost("/gettotalabsentemp",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var curr_date = $entity['curr_date'];
                var start_time=curr_date + " "+"00:00:00.000";
                var end_time=curr_date + " "+"23:59:59.000";
                var totalabsentemp = db.select("SELECT DISTINCT a.employee_id,a.first_name,a.middle_name,a.last_name,b.employee_designation_type_name as designation,d.department_name,e.site_name FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d  on c.department_id = d.department_id  INNER JOIN hls_schema_common.tbl_site_details as e on c.site_id = e.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as f on f.employee_id = a.employee_id  WHERE f.punches_disp_purpose = '' and a.employee_type_id = 1 and  f.for_date BETWEEN '" + start_time + "' AND '" + end_time + "'");
                var jsonResult = JSON.stringify(totalabsentemp);

                $exchange.send(jsonResult);
            } catch (e) {

                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )


    .onGet("/getallclusterlist",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['jndi:java:jboss/datasources/SQLServerDS', function ($exchange, db) {
            try {

                var all_cluster_list = db.select("SELECT cluster_id,cluster_name FROM hls_schema_common.tbl_cluster_details");
                var jsonResult = JSON.stringify(all_cluster_list);

                $exchange.send(jsonResult);
            } catch (e) {

                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )


    .onPost("/gettotalactivecards",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json','jndi:java:jboss/datasources/SQLServerDS', function ($exchange,$entity, db) {
            try {
                var curr_date = $entity['curr_date'];
                var activecards = db.select("SELECT count(DISTINCT a.card_id) as active_cards FROM hls_schema_acs.tbl_card_details as a inner join hls_schema_acs.tbl_card_holder_n_card_details as b on a.card_id = b.card_id where a.card_status_type = 1 and a.for_user_type = 1 and a.card_expiry_date > CAST('"+ curr_date +"' AS DATE)");
                var jsonResult = JSON.stringify(activecards);

                $exchange.send(jsonResult);
            } catch (e) {

                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )

    .onPost("/getclustertotalempcount",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var cluster_id=$entity['cluster_id'];
                var curr_date = $entity['curr_date'];
                if(cluster_id !== 109){
                    var query="SELECT count(DISTINCT a.employee_id) as total_employee FROM hls_schema_common.tbl_employee_details AS a  INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id   INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_site_details as f on e.site_id = f.site_id WHERE e.cluster_id="+cluster_id+" and a.employee_type_id=1 and a.retirement_date > CAST('" + curr_date + "' AS DATE)";
    
                    }else{
                    var query="SELECT count(DISTINCT a.employee_id) as total_employee FROM hls_schema_common.tbl_employee_details AS a  INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id  INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g on e.site_id = g.site_id WHERE f.cluster_id=109 and a.employee_type_id=1 and a.retirement_date > CAST('" + curr_date + "' AS DATE) and e.site_id IN(228,229)";
    
                    }
                
                var totalempcount = db.select(query);
                var jsonResult = JSON.stringify(totalempcount);
    
                $exchange.send(jsonResult);
            } catch (e) {
    
                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )
    
    
    .onPost("/getclustertotalpresentempcount",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var cluster_id=$entity['cluster_id'];
                var curr_date = $entity['curr_date'];
                var start_time=curr_date + " "+"00:00:00.000";
                var end_time=curr_date + " "+"23:59:59.000";
                if(cluster_id !== 109){
                    var query="SELECT COUNT(DISTINCT a.employee_id) as present_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose != '' and h.for_date between '"+ start_time+"' and '"+end_time+"'";

                }else{
                    var query="SELECT COUNT(DISTINCT a.employee_id) as present_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose != '' and e.site_id IN(228,229) and h.for_date between '"+ start_time+"' and '"+end_time+"'";

                }
                
                var totalpresentempcount = db.select(query);
                var jsonResult = JSON.stringify(totalpresentempcount);
    
                $exchange.send(jsonResult);
            } catch (e) {
    
                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )
    
    
    .onPost("/getclustertotalabsentempcount",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var cluster_id=$entity['cluster_id'];
                var curr_date = $entity['curr_date'];
                var start_time=curr_date + " "+"00:00:00.000";
                var end_time=curr_date + " "+"23:59:59.000";
                if(cluster_id !== 109){
                    var query="SELECT COUNT(DISTINCT a.employee_id) as absent_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose = '' and h.for_date between '"+ start_time+"' and '"+end_time+"'";

                }else{
                    var query="SELECT COUNT(DISTINCT a.employee_id) as absent_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose = '' and e.site_id IN(228,229) and h.for_date between '"+ start_time+"' and '"+end_time+"'";

                }
               
                var totalabsentempcount = db.select(query);
        
                var jsonResult = JSON.stringify(totalabsentempcount);
    
                $exchange.send(jsonResult);
            } catch (e) {
    
                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )
    
    
    .onPost("/getclusterpresent&totalempcount",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
               
                var cluster_id=$entity['cluster_id'];
                var curr_date = $entity['curr_date'];
                var start_time=curr_date + " "+"00:00:00.000";
                var end_time=curr_date + " "+"23:59:59.000";
                if(cluster_id !== 109){
                var total_query="SELECT count(DISTINCT a.employee_id) as total_count FROM hls_schema_common.tbl_employee_details AS a  INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id  INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g on e.site_id = g.site_id WHERE f.cluster_id="+cluster_id+" and a.employee_type_id=1 and a.retirement_date > CAST('" + curr_date + "' AS DATE)";
                var present_query="SELECT COUNT(DISTINCT a.employee_id) as present_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose != '' and h.for_date between '"+ start_time+"' and '"+end_time+"'";
                }else{
                var total_query="SELECT count(DISTINCT a.employee_id) as total_count FROM hls_schema_common.tbl_employee_details AS a  INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id  INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g on e.site_id = g.site_id WHERE f.cluster_id=109 and a.employee_type_id=1 and a.retirement_date > CAST('" + curr_date + "' AS DATE) and e.site_id IN(228,229)";
                var present_query="SELECT COUNT(DISTINCT a.employee_id) as present_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose != '' and e.site_id IN(228,229) and h.for_date between '"+ start_time+"' and '"+end_time+"'";
                }
               
                var totalempcount = db.select(total_query);
                
                var totalpresentempcount = db.select(present_query);
                var jsonResult = JSON.stringify({total_count:totalempcount,present_count:totalpresentempcount});
    
                $exchange.send(jsonResult);
            } catch (e) {
    
                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )

    
    .onPost("/getclustertotalemp",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var cluster_id=$entity['cluster_id'];
                var curr_date = $entity['curr_date'];
                if(cluster_id !== 109){
                    var query="SELECT DISTINCT a.employee_id,a.first_name,a.middle_name,a.last_name,b.employee_designation_type_name as designation,d.department_name,g.site_name FROM hls_schema_common.tbl_employee_details AS a  INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id  INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g on e.site_id = g.site_id WHERE f.cluster_id="+ cluster_id +" and a.employee_type_id=1 and a.retirement_date > CAST('" + curr_date + "' AS DATE)";

                }else{
                    var query="SELECT DISTINCT a.employee_id,a.first_name,a.middle_name,a.last_name,b.employee_designation_type_name as designation,d.department_name,g.site_name FROM hls_schema_common.tbl_employee_details AS a  INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id  INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g on e.site_id = g.site_id WHERE f.cluster_id="+ cluster_id +" and a.employee_type_id=1 and a.retirement_date > CAST('" + curr_date + "' AS DATE) and e.site_id IN(228,229)";

                }
               
                var totalemp = db.select(query);
                var jsonResult = JSON.stringify(totalemp);
    
                $exchange.send(jsonResult);
            } catch (e) {
    
                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )
    
    
    .onPost("/getclusterpresentemp",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var cluster_id=$entity['cluster_id'];
                var curr_date = $entity['curr_date'];
                var start_time=curr_date + " "+"00:00:00.000";
                var end_time=curr_date + " "+"23:59:59.000";
                if(cluster_id !== 109){
                    var query="SELECT DISTINCT a.employee_id,a.first_name,a.middle_name,a.last_name,b.employee_designation_type_name as designation,d.department_name,g.site_name,h.punches_disp_purpose FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose != '' and h.for_date between '"+ start_time+"' and '"+end_time+"'";

                }else{
                    var query="SELECT DISTINCT a.employee_id,a.first_name,a.middle_name,a.last_name,b.employee_designation_type_name as designation,d.department_name,g.site_name,h.punches_disp_purpose FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose != '' and e.site_id IN(228,229) and h.for_date between '"+ start_time+"' and '"+end_time+"'";

                }
              
                var totalpresentemp = db.select(query);
    
                var new_data = totalpresentemp.map(function (obj) {
                    var in_out_time_string = obj.punches_disp_purpose;
                    var entries = in_out_time_string.split(';').map(function (entry) {
                        return entry.trim();
                    }).filter(function (entry) {
                        return entry;
                    });
                
                    var inTimes = [];
                    var outTimes = [];
                
                    entries.forEach(function (entry) {
                        var match = entry.match(/(\d{2}:\d{2}:\d{2}) (\d{2}\/\d{2}\/\d{4})\((I|O)\)/);
                        if (match) {
                            var time = match[1];
                            var date = match[2];
                            var type = match[3];
                
                            if (type === 'I') {
                                inTimes.push(time);
                            } else if (type === 'O') {
                                outTimes.push(time);
                            }
                        }
                    });
                
                    var inTime = inTimes.length > 0 ? inTimes[0] : "-";
                    var outTime = outTimes.length > 0 ? outTimes[outTimes.length - 1] : "-";
                   
                
                    // ES5 doesn't have spread operators, so we manually copy properties.
                    var newObj = {};
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            newObj[key] = obj[key];
                        }
                    }
                    
                   
                    newObj.inTime = inTime;
                    newObj.outTime = outTime;
                
                    return newObj;
                });
    
                var jsonResult = JSON.stringify(new_data);
    
                $exchange.send(jsonResult);
            } catch (e) {
    
                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )
     
    
    .onPost("/getclusterabsentemp",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var cluster_id=$entity['cluster_id'];
                var curr_date = $entity['curr_date'];
                var start_time=curr_date + " "+"00:00:00.000";
                var end_time=curr_date + " "+"23:59:59.000";
                if(cluster_id !== 109){
                    var query="SELECT DISTINCT a.employee_id,a.first_name,a.middle_name,a.last_name,b.employee_designation_type_name as designation,d.department_name,g.site_name FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose = '' and h.for_date between '"+ start_time+"' and '"+end_time+"'";

                }else{
                    var query="SELECT DISTINCT a.employee_id,a.first_name,a.middle_name,a.last_name,b.employee_designation_type_name as designation,d.department_name,g.site_name FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g  on e.site_id = g.site_id INNER JOIN hls_schema_tam.tbl_attendance_management as h on h.employee_id = a.employee_id  WHERE f.cluster_id ="+cluster_id+" and h.punches_disp_purpose = '' and e.site_id IN(228,229) and h.for_date between '"+ start_time+"' and '"+end_time+"'";

                }
                
                var totalabsentemp = db.select(query);
                var jsonResult = JSON.stringify(totalabsentemp);
    
                $exchange.send(jsonResult);
            } catch (e) {
    
                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )



    .onPost("/getclustersitelist",
        { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
        ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
            try {
                var cluster_id = $entity['cluster_id'];
                var sitelist = db.select("SELECT b.site_id,b.site_name,a.cluster_id FROM [HLS_DB].[hls_schema_common].[tbl_cluster_site_group] as a INNER JOIN [HLS_DB].[hls_schema_common].[tbl_site_details] as b ON a.site_id=b.site_id where cluster_id ="+cluster_id);
                var jsonResult = JSON.stringify(sitelist);

                $exchange.send(jsonResult);
            } catch (e) {

                var errorResult = JSON.stringify({ success: false, error: e.message });
                $exchange.send(errorResult);
            }
        }]
    )





    // .onPost("/getdelhisitedetails",
    //     { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
    //     ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
    //         try {
    //             var curr_date = $entity['curr_date'];
    //             var start_time=curr_date + " "+"00:00:00.000";
    //             var end_time=curr_date + " "+"23:59:59.000";
    //             var total_count = db.select("SELECT count(DISTINCT a.employee_id) as total_count FROM hls_schema_common.tbl_employee_details AS a  INNER JOIN hls_schema_common.tbl_employee_designation_type_details as b on a.designation_id = b.employee_designation_type_id INNER JOIN hls_schema_common.tbl_department_site_details as c on a.department_site_ref_id = c.ref_id INNER JOIN hls_schema_common.tbl_department_details as d on c.department_id = d.department_id INNER JOIN hls_schema_common.tbl_cluster_site_group as e on c.site_id = e.site_id  INNER JOIN hls_schema_common.tbl_cluster_details as f on e.cluster_id = f.cluster_id INNER JOIN hls_schema_common.tbl_site_details as g on e.site_id = g.site_id WHERE f.cluster_id=109 and a.retirement_date > CAST('" + curr_date + "' AS DATE) and e.site_id IN(228,229)");
    //             var present_count=db.select("SELECT count(DISTINCT a.employee_id) as present_count FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_acs.tbl_card_holder_n_card_details AS b ON a.employee_id = b.card_holder_id INNER JOIN hls_schema_acs.tbl_card_details AS c ON b.card_id = c.card_id INNER JOIN hls_schema_common.tbl_cluster_site_group AS d ON c.site_id = d.site_id INNER JOIN hls_schema_common.tbl_site_details AS e ON d.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details AS i ON d.cluster_id = i.cluster_id INNER JOIN hls_schema_common.tbl_department_site_details AS f ON f.ref_id = a.department_site_ref_id INNER JOIN hls_schema_common.tbl_department_details AS g ON f.department_id = g.department_id INNER JOIN hls_schema_common.tbl_employee_designation_type_details AS h ON a.designation_id = h.employee_designation_type_id INNER JOIN hls_schema_tam.tbl_attendance_management AS j ON a.employee_id = j.employee_id WHERE d.cluster_id IN(109) and j.punches_disp_purpose != '' and e.site_id IN(228,229) and j.for_date between '"+ start_time+"' and '"+end_time+"'");
    //             var jsonResult = JSON.stringify({total_count:total_count,present_count:present_count});

    //             $exchange.send(jsonResult);
    //         } catch (e) {

    //             var errorResult = JSON.stringify({ success: false, error: e.message });
    //             $exchange.send(errorResult);
    //         }
    //     }]
    // )

    
    // .onPost("/clusterdatabyclusterid",
    //     { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "application/json" } },
    //     ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, requestBody, db) {

    //         try {
    //             var cluster_id = requestBody.cluster_id;
    //             var query = "SELECT TOP 20000 a.employee_id,a.first_name + ' ' + a.middle_name + ' ' + a.last_name as employee_name,h.employee_designation_type_name as designation,g.department_name,e.site_name,i.cluster_id,i.cluster_name,hls_schema_tam.tbl_attendance_management.for_date FROM hls_schema_common.tbl_employee_details AS a INNER JOIN hls_schema_acs.tbl_card_holder_n_card_details AS b ON a.employee_id = b.card_holder_id INNER JOIN hls_schema_acs.tbl_card_details AS c ON b.card_id = c.card_id INNER JOIN hls_schema_common.tbl_cluster_site_group AS d ON c.site_id = d.site_id INNER JOIN hls_schema_common.tbl_site_details AS e ON d.site_id = e.site_id INNER JOIN hls_schema_common.tbl_cluster_details AS i ON d.cluster_id = i.cluster_id INNER JOIN hls_schema_common.tbl_department_site_details AS f ON f.ref_id = a.department_site_ref_id INNER JOIN hls_schema_common.tbl_department_details AS g ON f.department_id = g.department_id INNER JOIN hls_schema_common.tbl_employee_designation_type_details AS h ON a.designation_id = h.employee_designation_type_id Inner JOIN hls_schema_tam.tbl_attendance_management ON d.site_id=hls_schema_tam.tbl_attendance_management.site_id WHERE d.cluster_id =" + cluster_id;
    //             var cluster_data = db.select(query);
    //             var jsonResult = JSON.stringify(cluster_data);

    //             $exchange.send(jsonResult); // Send the result
    //         } catch (e) {
    //             var errorResult = JSON.stringify({ success: false, error: e.message });
    //             $exchange.send(errorResult); // Send error message if something goes wrong
    //         }
    //     }]
    // )


// .onPost("/test",
//     { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
//     ['$entity:json', 'jndi:java:jboss/datasources/SQLServerDS', function ($exchange, $entity, db) {
//         try {
//             var curr_date = $entity['curr_date'];
//             var totalpresentemp = db.select("SELECT TOP 1000 hls_schema_tam.tbl_attendance_management.employee_id,hls_schema_common.tbl_employee_details.first_name, hls_schema_tam.tbl_attendance_management.for_date,hls_schema_tam.tbl_attendance_management.punches_disp_purpose FROM hls_schema_tam.tbl_attendance_management INNER JOIN hls_schema_common.tbl_employee_details ON hls_schema_tam.tbl_attendance_management.employee_id = hls_schema_common.tbl_employee_details.employee_id where punches_disp_purpose !='' AND for_date='" + curr_date + " " + "22:00:00:000'");
           
//             var new_data = totalpresentemp.map(function (obj) {
//                 var in_out_time_string = obj.punches_disp_purpose;
//                 var entries = in_out_time_string.split(';').map(function (entry) {
//                     return entry.trim();
//                 }).filter(function (entry) {
//                     return entry;
//                 });
            
//                 var inTimes = [];
//                 var outTimes = [];
            
//                 entries.forEach(function (entry) {
//                     var match = entry.match(/(\d{2}:\d{2}:\d{2}) (\d{2}\/\d{2}\/\d{4})\((I|O)\)/);
//                     if (match) {
//                         var time = match[1];
//                         var date = match[2];
//                         var type = match[3];
            
//                         if (type === 'I') {
//                             inTimes.push(time);
//                         } else if (type === 'O') {
//                             outTimes.push(time);
//                         }
//                     }
//                 });
            
//                 var inTime = inTimes.length > 0 ? inTimes[0] : "-";
//                 var outTime = outTimes.length > 0 ? outTimes[outTimes.length - 1] : "-";
//                 var Date = obj.for_date.split(' ')[0];
            
//                 // ES5 doesn't have spread operators, so we manually copy properties.
//                 var newObj = {};
//                 for (var key in obj) {
//                     if (obj.hasOwnProperty(key)) {
//                         newObj[key] = obj[key];
//                     }
//                 }
                
//                 newObj.for_date = Date;
//                 newObj.inTime = inTime;
//                 newObj.outTime = outTime;
            
//                 return newObj;
//             });
            
           
//             var jsonResult = JSON.stringify(new_data);
//             $exchange.send(jsonResult);
//         } catch (e) {

//             var errorResult = JSON.stringify({ success: false, error: e.message });
//             $exchange.send(errorResult);
//         }
//     }]
// )




