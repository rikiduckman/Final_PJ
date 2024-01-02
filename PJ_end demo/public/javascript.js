var Tsubject=[
  {
  s1: "Social Sciences Research Methodology",
  s2: "ASEAN Studies",
  s3: "Quality of Life and Social Development",
  s4: "Sufficiency Economy for Living",
  s5: "Youngster with Good Heart"
  },
  {
    gs1: "A",
    gs2: "B",
    gs3: "C",
    gs4: "D",
    gs5: "F"
  }
]
var user1 = [
  {
  Fname: "ณภัทร์",
  Lname: "แซ่เตียว",
  Sid: "64502100116-1",
  },
  {
  titblesub: "กลุ่มวิชาสังคมศาสตร์",
  sub1: "Man and Society",
  g1 : "A"
  }
]

var subject = document.getElementById("sub1");
var grade = document.getElementById("g1");
subject.innerHTML = user1[1].sub1;
grade.innerHTML = user1[1].g1;

function checkData() {
  // รับค่าที่ผู้ใช้กรอกเข้ามา
  var inputFname = document.getElementById("fname").value;
  var inputLname= document.getElementById("lname").value;
  var inputSid = document.getElementById("sid").value;
  // เปรียบเทียบข้อมูล
  if (inputFname === user1[0].Fname) {
    if(inputLname === user1[0].Lname){
      if(inputSid === user1[0].Sid){
        alert("ข้อมูลถูกต้อง");
        document.getElementById("container-cal").style.display = "block";
        document.getElementById("container-subject").style.display = "block";
      }
      else {
        alert("ข้อมูลไม่ตรงกับที่มีอยู่");
        // กระทำหรือแสดงข้อมูลอื่นที่ต้องการเมื่อข้อมูลไม่ตรง
      }
    }
    else {
      alert("ข้อมูลไม่ตรงกับที่มีอยู่");
      // กระทำหรือแสดงข้อมูลอื่นที่ต้องการเมื่อข้อมูลไม่ตรง
    }
  } 
  else {
    alert("ข้อมูลไม่ตรงกับที่มีอยู่");
    // กระทำหรือแสดงข้อมูลอื่นที่ต้องการเมื่อข้อมูลไม่ตรง
  }
}
  document.getElementById('s1').innerHTML = Tsubject[0].s1;
  document.getElementById('s2').innerHTML = Tsubject[0].s2;
  document.getElementById('s3').innerHTML = Tsubject[0].s3;
  document.getElementById('s4').innerHTML = Tsubject[0].s4;

  document.getElementById('gs1').innerHTML = Tsubject[1].gs1;
  document.getElementById('gs2').innerHTML = Tsubject[1].gs1;
  document.getElementById('gs3').innerHTML = Tsubject[1].gs3;
  document.getElementById('gs4').innerHTML = Tsubject[1].gs5;