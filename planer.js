var hash
var current_plan
var next_plan
var qrcode

window.onhashchange = startup

function generate_hash(object) {
    return encodeURIComponent(JSON.stringify(object))
}

function update_location_hash() {
    window.location.hash = "#" + generate_hash(current_plan)
    var qr = qrcode(0, "L");
    qr.addData(window.location.toString())
    qr.make()
    document.getElementById('qrcode').innerHTML = qr.createImgTag(4);
}

function offset_date_by_weeks(date, weeks, days = 0) {
    return new Date((new Date(date)).getTime() + 24 * 60 * 60 * 1000 * (weeks * 7 + days))
}

function date_to_str(date) {
    return date.toISOString().substring(0, 10)
}

function load_hash_data() {
    hash = window.location.hash.substring(1);

    if (hash.length == 0) {
        console.log("no data in fragment, use default")
        current_plan = {
            "v": 1,
            "workers": ["Hans", "Peter", "Gunter", "Julia", "Anne", "Lina"],
            "start_date": "2021-10-25",
            "duties": ["Kitchen", "Trash"],
            "offsets": [0, 3]
        }
    } else {
        current_plan = JSON.parse(decodeURIComponent(hash))
        console.log("loaded data")
    }

}

function process_plan() {
    if (current_plan.v !== 1) {
        console.log("wrong version!")
        return
    }

    if (current_plan.duties.length != 2) {
        console.log("currently unsupported number of duties")
        return
    }

    const weeks_per_sheet = 26
    document.getElementById("duty_table").innerHTML = ""
    let table = document.createElement("table")
    let top_row = document.createElement("tr")
    let a_duty_title = document.createElement("th")
    a_duty_title.innerText = current_plan.duties[0]
    let date_title = document.createElement("th")
    date_title.innerText = "Date"
    let b_duty_title = document.createElement("th")
    b_duty_title.innerText = current_plan.duties[1]
    top_row.appendChild(a_duty_title)
    top_row.appendChild(date_title)
    top_row.appendChild(b_duty_title)
    table.appendChild(top_row)

    console.log(current_plan.start_date)

    for (let i = 0; i < weeks_per_sheet; i++) {
        let row = document.createElement("tr")
        let a_duty = document.createElement("td")
        a_duty.innerText = current_plan.workers[(current_plan.offsets[0] + i) % current_plan.workers.length]
        let date = document.createElement("td")
        date.innerText = date_to_str(offset_date_by_weeks(current_plan.start_date, i)) + " to " + date_to_str(offset_date_by_weeks(current_plan.start_date, i, 6)).substring(4)
        let b_duty = document.createElement("td")
        b_duty.innerText = current_plan.workers[(current_plan.offsets[1] + i) % current_plan.workers.length]
        row.appendChild(a_duty)
        row.appendChild(date)
        row.appendChild(b_duty)
        table.appendChild(row)
    }
    document.getElementById("duty_table").appendChild(table)

    next_plan = JSON.parse(JSON.stringify(current_plan));
    next_plan.start_date = offset_date_by_weeks(current_plan.start_date, weeks_per_sheet).toISOString()
    for (let i = 0; i < next_plan.offsets.length; i++) [
        next_plan.offsets[i] = (current_plan.offsets[i] + weeks_per_sheet) % current_plan.workers.length
    ]
    let url = document.location.toString().split("#")[0]
    url += "#" + generate_hash(next_plan)
    document.getElementById("next_plan_link").href = url

    update_location_hash()
}

function startup() {
    load_hash_data()
    process_plan()
}

function go_to_next_plan() {
    current_plan = next_plan
    process_plan()
}


