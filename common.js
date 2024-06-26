
window.onhashchange = startup

function generate_hash(object) {
    return encodeURIComponent(JSON.stringify(object))
}


function offset_date_by_weeks(date, weeks, days = 0) {
    return new Date((new Date(date)).getTime() + 24 * 60 * 60 * 1000 * (weeks * 7 + days))
}

function date_to_str(date) {
    return date.toISOString().substring(0, 10)
}

const duty_length_not_allowed = (object) => {
    return object.length < 1 || object.length > 2
}

function default_data() {
    const defaultd = {
        "v": 2,
        "workers": [["Hans", "Peter", "Gunter"], ["Julia", "Anne", "Lina"]],
        "start_date": (new Date()).toISOString(),
        "duties": ["Kitchen", "Trash"],
        "offsets": [0, 2]
    }
    return JSON.parse(JSON.stringify(defaultd))
}

function load_hash_data() {
    hash = window.location.hash.substring(1);

    if (hash.length === 0) {
        console.log("no data in fragment, use default")
        current_plan = default_data()
    } else {
        try {
            current_plan = JSON.parse(decodeURIComponent(hash))
        } catch (e) {
            alert("The data in the uri was corrupted. loading default data")
            current_plan = default_data()
        }
        console.log("loaded data")
    }

}
