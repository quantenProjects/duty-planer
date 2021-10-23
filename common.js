
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

function load_hash_data() {
    hash = window.location.hash.substring(1);

    if (hash.length == 0) {
        console.log("no data in fragment, use default")
        current_plan = {
            "v": 1,
            "workers": ["Hans", "Peter", "Gunter", "Julia", "Anne", "Lina"],
            "start_date": (new Date()).toISOString(),
            "duties": ["Kitchen", "Trash"],
            "offsets": [0, 3]
        }
    } else {
        current_plan = JSON.parse(decodeURIComponent(hash))
        console.log("loaded data")
    }

}
