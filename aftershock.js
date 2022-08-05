      let m1, m2, m3, a, b, c, p;
      let mag;

      function loadQuake(cFunction) {
        let quakeID = document.getElementById("QuakeID").value;
        let patt = new RegExp("[^0-9a-z]");
        if (patt.test(quakeID) == true) {
          alert("invalid QuakeID:" + quakeID);
          return;
        }

        let QuakeURL =
          "https://api.geonet.org.nz/quake/" +
          document.getElementById("QuakeID").value;
        document.getElementById("mag").value = "";
        document.getElementById("quakeTime").value = "";

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            cFunction(this);
          } else {
            document.getElementById("info").innerHTML = "";
          }
        };
        xhttp.open("GET", QuakeURL, true);
        xhttp.send();
      }

      function getQuake(xhttp) {
        if (xhttp.responseText.indexOf("magnitude") < 1) {
          alert("Quake not found");
        } else {
          let myQuake = JSON.parse(xhttp.responseText);
          let d = new Date();
          let n = d.toISOString();
          mag = myQuake.features[0].properties.magnitude;
          document.getElementById("mag").value = mag;
          document.getElementById("quakeTime").value =
            myQuake.features[0].properties.time;
          d.setDate(myQuake.features[0].properties.time);
          document.getElementById("startTime").value = n;

          m1 = Math.round(mag - 0.5);
          if (m1 > 1) {
            m2 = Math.round(mag - 0.5) - 1;
          }
          if (m1 > 2) {
            m3 = Math.round(mag - 0.5) - 2;
          }
          document.getElementById("M1").value = m1;
          document.getElementById("M2").value = m2;
          document.getElementById("M3").value = m3;
          document.getElementById("doAfters").disabled = false;
        }
      }

      function doCalc() {
        mag = document.getElementById("mag").value;
        m1 = document.getElementById("M1").value;
        m2 = document.getElementById("M2").value;
        m3 = document.getElementById("M3").value;

        if (m1 > 8 || m2 >= m1 || m3 >= m2) {
          alert(
            "Magnitude ranges should be in ascending order (e.g. 5,4,3) and no larger than 8"
          );
          return;
        }

        let quakeTime = new Date(document.getElementById("quakeTime").value);
        let aftershockStartTime = new Date(document.getElementById("startTime").value);

        if (quakeTime > aftershockStartTime) {
          alert("Start Time must be after Quake Time");
          return;
        }

        if (parseInt(document.getElementById("duration").value) < 0||parseInt(document.getElementById("duration").value) > 720) {
          alert("Duration must be 0-720");
          return;
        }

        if (mag >= 10) {
          alert("Initial Quake MAG too large! Please enter a number<10");
          return;
        }

        document.getElementById("qID").innerHTML =
          document.getElementById("QuakeID").value;
        document.getElementById("Range1").innerHTML = "M" + m1.toString() + "+";
        document.getElementById("Range2").innerHTML =
          "M" + Math.round(m2).toString() + "-M" + m1.toString() + "";
        document.getElementById("Range3").innerHTML =
          "M" + Math.round(m3).toString() + "-M" + m2.toString() + "";

        a = parseFloat(document.getElementById("a").value);
        b = parseFloat(document.getElementById("b").value);
        c = parseFloat(document.getElementById("c").value);
        p = parseFloat(document.getElementById("p").value);

        let rangeStartFromQuakeTime = (aftershockStartTime.valueOf() - quakeTime.valueOf()) / (1000 * 60 * 60 * 24); //days and parts there of between the start date and the quaketime
        let rangeEndFromQuakeTime = rangeStartFromQuakeTime + parseInt(document.getElementById("duration").value);
        let fOmoriIntegral =
          (Math.pow(rangeEndFromQuakeTime + c, 1 - p) - Math.pow(rangeStartFromQuakeTime + c, 1 - p)) / (1 - p);


        let vNabuNZ1 = Math.pow(10, a + b * (mag - m1)) * fOmoriIntegral;
        let vNabuNZ2 = Math.pow(10, a + b * (mag - m2)) * fOmoriIntegral;
        let vNabuNZ3 = Math.pow(10, a + b * (mag - m3)) * fOmoriIntegral;

        //Average number
        document.getElementById("within").innerHTML =
          "within " + document.getElementById("duration").value + " days";
        document.getElementById("M1R").innerHTML = vNabuNZ1.toFixed(2);
        let vDif = vNabuNZ2 - vNabuNZ1;
        document.getElementById("M2R").innerHTML =
          vDif.toFixed(2) + "-" + vNabuNZ2.toFixed(2);
        vDif = vNabuNZ3 - vNabuNZ2;
        document.getElementById("M3R").innerHTML =
          vDif.toFixed(2) + "-" + vNabuNZ3.toFixed(2);

        let p1 = 100 * (1 - Math.exp(-vNabuNZ1));
        let p2 = 100 * (1 - Math.exp(-(vNabuNZ2 - vNabuNZ1)));
        let p3 = 100 * (1 - Math.exp(-(vNabuNZ3 - vNabuNZ2)));

        //probabilities
        document.getElementById("M1P").innerHTML = p1.toFixed(3);
        document.getElementById("M2P").innerHTML = p2.toFixed(3);
        document.getElementById("M3P").innerHTML = p3.toFixed(3);

        let p1U = qpois_sue(0.975, vNabuNZ1);
        let p1L = qpois_sue(0.025, vNabuNZ1);
        let p2U = qpois_sue(0.975, vNabuNZ2 - vNabuNZ1);
        let p2L = qpois_sue(0.025, vNabuNZ2 - vNabuNZ1);
        let p3U = qpois_sue(0.975, vNabuNZ3 - vNabuNZ2);
        let p3L = qpois_sue(0.025, vNabuNZ3 - vNabuNZ2);

        //Range
        document.getElementById("M1A").innerHTML =
          p1L.toFixed(0) + "-" + p1U.toFixed(0);
        document.getElementById("M2A").innerHTML =
          p2L.toFixed(0) + "-" + p2U.toFixed(0);
        document.getElementById("M3A").innerHTML =
          p3L.toFixed(0) + "-" + p3U.toFixed(0);
      }

      function clearResults(zone) {
        document.getElementById("Range1").innerHTML = "Mag range 1";
        document.getElementById("Range2").innerHTML = "Mag range 2";
        document.getElementById("Range3").innerHTML = "Mag range 3";
        document.getElementById("M1R").innerHTML = "";
        document.getElementById("M2R").innerHTML = "";
        document.getElementById("M3R").innerHTML = "";
        document.getElementById("M1A").innerHTML = "";
        document.getElementById("M2A").innerHTML = "";
        document.getElementById("M3A").innerHTML = "";
        document.getElementById("M1P").innerHTML = "";
        document.getElementById("M2P").innerHTML = "";
        document.getElementById("M3P").innerHTML = "";
        document.getElementById("info").innerHTML = "";
        document.getElementById("qID").innerHTML = "";
        document.getElementById("within").innerHTML = "within nn days";

        if (zone == "1") {
          if (document.getElementById("nz").checked == true) {
            document.getElementById("b").value = 1.03;
            document.getElementById("a").value = -1.59;
            document.getElementById("c").value = 0.04;
            document.getElementById("p").value = 1.07;
            document.getElementById("a").disabled = true;
            document.getElementById("b").disabled = true;
            document.getElementById("c").disabled = true;
            document.getElementById("p").disabled = true;
          }
          if (document.getElementById("sz").checked == true) {
            document.getElementById("b").value = 1.0;
            document.getElementById("a").value = -1.97;
            document.getElementById("c").value = 0.018;
            document.getElementById("p").value = 0.92;
            document.getElementById("a").disabled = true;
            document.getElementById("b").disabled = true;
            document.getElementById("c").disabled = true;
            document.getElementById("p").disabled = true;
          }
          if (document.getElementById("cm").checked == true) {
            document.getElementById("a").disabled = false;
            document.getElementById("b").disabled = false;
            document.getElementById("c").disabled = false;
            document.getElementById("p").disabled = false;
          }
        }
      }

      // see https://www.lexifi.com/blog/quant/efficient-simulation-method-poisson-distribution/

      function qpois_sue(p, lambda) {
        let inc = Math.exp(-1 * lambda);
        let n = 0;
        let sum = inc;
        count = 1000;

  
        while (sum < p && count > 0) {
          n = n + 1;
          inc = (inc * lambda) / n;
          sum = sum + inc;
          count = count - 1;
        }

        return n;
      }
