const express = require("express");
const app = express();
const request = require("request");
const cron = require('node-cron');

app.use(express.static("public"));
app.use(express.json());

app.set("view engine", "ejs");

const terrace = [
    { name: "Lamp", tombol: "20", lamps: [
        { id: 1, name: "Lamp 1", state: "off", onTime: null, offTime: null },
        { id: 2, name: "Lamp 2", state: "off", onTime: null, offTime: null }
    ] },
    { name: "CCTV", tombol: "22", lamps: [] },
    { name: "Gate", tombol: "21", lamps: [] },
    { name: "Fish Pond", tombol: "23", lamps: [] },
];

app.get("/", function (req, res) {
    res.render("homepage.ejs");
});

app.get("/terrace", function (req, res) {
    res.render("terrace", {
        terrace: terrace
    });
});

app.get("/info/:tombol", function (req, res) {
    const tombol = req.params.tombol;
    const userInfo = terrace.find(user => user.tombol === tombol);

    if (userInfo) {
        res.render("info", { userInfo, lamps: userInfo.lamps });
    } else {
        res.status(404).send("User not found");
    }
});

app.post("/setTimer/:lampId", function (req, res) {
    const lampId = parseInt(req.params.lampId);
    const { onTime, offTime } = req.body;
    let lamp;

    terrace.forEach(area => {
        area.lamps.forEach(l => {
            if (l.id === lampId) {
                lamp = l;
            }
        });
    });

    if (lamp) {
        lamp.onTime = onTime;
        lamp.offTime = offTime;
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.get("/checkTimers", function (req, res) {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Jakarta' }).slice(0, 5);
    terrace.forEach(area => {
        area.lamps.forEach(lamp => {
            if (lamp.onTime && lamp.offTime) {
                if (currentTime === lamp.onTime) {
                    lamp.state = "on";
                } else if (currentTime === lamp.offTime) {
                    lamp.state = "off";
                }
            }
        });
    });
    res.json(terrace.flatMap(area => area.lamps));
});

// Use cron job to check timers every minute
cron.schedule('* * * * *', () => {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Jakarta' }).slice(0, 5);
    terrace.forEach(area => {
        area.lamps.forEach(lamp => {
            if (lamp.onTime && lamp.offTime) {
                if (currentTime === lamp.onTime) {
                    lamp.state = "on";
                } else if (currentTime === lamp.offTime) {
                    lamp.state = "off";
                }
            }
        });
    });
});

app.get("/about", function (req, res) {
    const about = [
        {
            creator: "Yossi Febriyana",
            desc: "Yossi merupakan seorang mahasiswa UPI pada Program Studi Pendidikan Teknik Elektro dengan konsentrasi Elektro Telekomunikasi",
            nick: "Yossi biasa dipanggil Oci"
        },
        {
            creator: "Yuri Nur Azizah",
            desc: "Yuri merupakan seorang mahasiswa UPI pada Program Studi Pendidikan Teknik Elektro dengan konsentrasi Elektro Telekomunikasi",
            nick: "Yuri biasa dipanggil Yuri"
        }
    ];
    res.render("about.ejs", {
        about: about
    });
});

app.get("/pics", function (req, res) {
    var searchTerm = req.query.searchterm;
    var pageNumber = req.query.page;
    console.log(searchTerm);
    request("https://api.unsplash.com/search/photos?client_id=a23535d66eec2d81f1d9aea445095e620bf47ec2df2b80266d2b7b92adf2d844&query=" + searchTerm + "&page=" + pageNumber, function (error, response, body) {
        if (error) {
            console.log(error);
        } else {
            res.render("pictures", {
                picData: JSON.parse(body),
                pageNumber: pageNumber
            });
        }
    });
});

app.get("/search", function (req, res) {
    res.render("search");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.listen("3000", function () {
    console.log("your website is online.");
});
