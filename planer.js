var hash
var current_plan
var next_plan
var qrcode


function update_location_hash() {
    window.location.hash = "#" + generate_hash(current_plan)
    document.getElementById("settings_link").href = "./settings.html#" + generate_hash(current_plan)
    var qr = qrcode(0, "L");
    qr.addData(window.location.toString())
    qr.make()
    document.getElementById('qrcode').innerHTML = qr.createImgTag(2);
}

function startup() {
    load_hash_data()
    process_plan()
}

function get_workers(current_plan, duty_number) {
    if (current_plan.v === 1) {
        return current_plan.workers
    } else if (current_plan.v === 2) {
        if (current_plan.workers.length > duty_number) {
            // we have a dedicated worker list for this duty
            return current_plan.workers[duty_number]
        } else {
            // we don't have a dedicated worker list for this duty, default to the first
            return current_plan.workers[0]
        }
    } else {
        alert("Internal error, try recreating on settings page!")
    }
}

function process_plan() {
    if (!(current_plan.v === 1 || current_plan.v === 2)) {
        console.log("wrong version!")
        return
    }

    if (duty_length_not_allowed(current_plan.duties)) {
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
    top_row.appendChild(a_duty_title)
    top_row.appendChild(date_title)
    if (current_plan.duties.length > 1) {
        let b_duty_title = document.createElement("th")
        b_duty_title.innerText = current_plan.duties[1]
        top_row.appendChild(b_duty_title)
    }
    table.appendChild(top_row)

    console.log(current_plan.start_date)

    let share_text = "current plan doesn't include today"
    let today = new Date()

    let a_worker = get_workers(current_plan, 0)
    let b_worker = get_workers(current_plan, 1)

    for (let i = 0; i < weeks_per_sheet; i++) {
        let start_of_week = offset_date_by_weeks(current_plan.start_date, i)
        let end_of_week = offset_date_by_weeks(current_plan.start_date, i, 6)
        let row = document.createElement("tr")
        let a_duty = document.createElement("td")
        a_duty.innerText = a_worker[(current_plan.offsets[0] + i) % a_worker.length]
        a_duty.classList.add("duty_a_td")
        let date = document.createElement("td")
        date.innerText = date_to_str(start_of_week) + " to " + date_to_str(end_of_week).substring(7)
        date.classList.add("date_td")
        let b_duty = document.createElement("td")
        b_duty.innerText = b_worker[(current_plan.offsets[1] + i) % b_worker.length]
        b_duty.classList.add("duty_b_td")
        row.appendChild(a_duty)
        row.appendChild(date)
        if (current_plan.duties.length > 1) {
            row.appendChild(b_duty)
        }
        table.appendChild(row)

        if (start_of_week <= today && today <= end_of_week) {
            share_text = "From " + date_to_str(start_of_week) + " to " + date_to_str(end_of_week) + "\n"
            share_text += current_plan.duties[0] + ": " + a_worker[(current_plan.offsets[0] + i) % a_worker.length]
            if (current_plan.duties.length > 1) {
                share_text += "\n" + current_plan.duties[1] + ": " + b_worker[(current_plan.offsets[1] + i) % b_worker.length]
            }
        }
        console.log(share_text)

    }
    document.getElementById("duty_table").appendChild(table)

    next_plan = JSON.parse(JSON.stringify(current_plan));
    next_plan.start_date = offset_date_by_weeks(current_plan.start_date, weeks_per_sheet).toISOString()
    for (let i = 0; i < next_plan.offsets.length; i++) {
        next_plan.offsets[i] = (current_plan.offsets[i] + weeks_per_sheet) % get_workers(current_plan, i).length
    }
    let url = document.location.toString().split("#")[0]
    url += "#" + generate_hash(next_plan)
    document.getElementById("next_plan_link").href = url

    document.getElementById("share_text").value = share_text

    update_location_hash()
}

