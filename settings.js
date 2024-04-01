var hash
var current_plan

function startup() {
    load_hash_data()
    url_to_form()
    form_to_url()
}

function onformchange() {
    form_to_url()
}

function multiline_to_array(multilinestring) {
    return multilinestring.split("\n").filter(line => line.length > 0)
}

function get_form_param(id) {
    return multiline_to_array(document.getElementById(id).value)
}

function form_to_url() {
    current_plan = {
        "v": 2,
        "start_date": document.getElementById("start_date").value,
        "duties": get_form_param("duties"),
        "offsets": get_form_param("offsets").map(x => parseInt(x))
    }
    let workers = []
    let one_worker_pool = []
    for (let line of get_form_param("workers".split("\n"))) {
       if (line === "---") {
           workers.push(one_worker_pool)
           one_worker_pool = []
       } else if (line.length > 0) {
           one_worker_pool.push(line)
       }
    }
    workers.push(one_worker_pool)
    current_plan.workers = workers
    let error_list = ""
    if (current_plan.start_date.length < 1) {
        error_list += "Enter a start date\n"
    }
    if (current_plan.workers.length < 1) {
        error_list += "No worker at all\n"
    }
    for (const [i, worker_pool] of current_plan.workers.entries()) {
        if (worker_pool.length < 1) {
            error_list += "Worker of pool number " + (i+1) + " has no workers\n"
        }
    }
    if (duty_length_not_allowed(current_plan.workers)) {
        error_list += "The number of worker pools doesn't match the number of allowed duties\n"
    }
    if (duty_length_not_allowed(current_plan.duties)) {
        error_list += "Only one or two duties are currently supported\n"
    }
    if (current_plan.duties.length !== current_plan.offsets.length) {
        error_list += "Duties and offsets must have the same number of lines!\n"
    }
    for (let i = 0; i < current_plan.offsets.length; i++) {
        if (isNaN(current_plan.offsets[i])) {
            error_list += "A line in the offsets is not an integer!\n"
        }
    }
    if (error_list.length === 0) {
        document.getElementById("error_list").innerText = "Everything okay"
        document.getElementById("error_list").style = "color:green"
        document.getElementById("plan_link").href = "./planer.html#" + generate_hash(current_plan)
        document.getElementById("plan_link").innerText = "Link to Plan"
        history.replaceState(null, null, "#" + generate_hash(current_plan))
    } else {
        document.getElementById("error_list").innerText = error_list
        document.getElementById("error_list").style = "color:red"
        document.getElementById("plan_link").removeAttribute("href")
        document.getElementById("plan_link").innerText = "There are errors"
        history.replaceState(null, null, "#")
    }
}

function url_to_form() {
    if (current_plan.v === 1) {
        document.getElementById("workers").value = current_plan.workers.join("\n")
    } else {
        document.getElementById("workers").value = current_plan.workers.map((worker_pool) => worker_pool.join("\n")).join("\n---\n")
    }
    document.getElementById("duties").value = current_plan.duties.join("\n")
    document.getElementById("offsets").value = current_plan.offsets.join("\n")
    document.getElementById("start_date").value = current_plan.start_date.substring(0, 10)
}