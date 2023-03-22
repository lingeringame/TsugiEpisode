
function populateList() {
    let iterTitles = localStorage.getItem("tsugiStorage"); 
    if(iterTitles !== null) {
        let iterTitlesArr = JSON.parse(iterTitles);
        for(let title of iterTitlesArr) {
            console.log(title);
            populateFromLS(title);
        }
    }
}

populateList();
function populateFromLS(data) {
    var query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
        id
        nextAiringEpisode {
            timeUntilAiring
            episode
        }
        title {
            romaji
            english
            native
        }
      }
    }
    `;

    var variables = {
        search: data
    };

    var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };
    fetch(url, options).then(handleResponse)
    .then(handleDataLS)
    .catch(handleError);
}

function sendRequest(data) {
    var query = `
    query ($search: String) {
      Media (search: $search, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
        id
        nextAiringEpisode {
            timeUntilAiring
            episode
        }
        title {
            romaji
            english
            native
        }
      }
    }
    `;

    var variables = {
        search: data
    };


    var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };


    fetch(url, options).then(handleResponse)
    .then(handleData)
    .catch(handleError);
}


let dataElement = document.querySelector("#episode-data");
let trackListElem = document.querySelector("#trackList");
let input;

document.getElementById("searchAnime").addEventListener("keypress", function(e) {
    if(e.key === "Enter") {
        input = document.getElementById("searchAnime").value;
        sendRequest(input);
    }
})

document.getElementById("searchBtn").addEventListener("click", function() {
    input = document.getElementById("searchAnime").value;
    sendRequest(input);
});

document.getElementById("ClearList").addEventListener("click", function() {
    localStorage.removeItem("tsugiStorage");
    trackListElem.innerHTML = "";
});


function resetTrackList() {
    
}
//fetch functions
function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    console.log("here");
    if(data.data.Media.nextAiringEpisode === null) {
        if(data.data.Media.title.english === null) {
            dataElement.innerHTML = `${data.data.Media.title.romaji} is not airing.`;
        } else {
            dataElement.innerHTML = `${data.data.Media.title.english} is not airing.`;
        }
    } else {
        let TUA = data.data.Media.nextAiringEpisode.timeUntilAiring / 3600;
        let days = TUA / 24;
        let hours = TUA % 24;
        dataElement.innerHTML = `<div>${data.data.Media.title.english} <span style="color:#72bb53;font-weight:bold;">Episode ${data.data.Media.nextAiringEpisode.episode} airs in ${Math.round(days)} days, ${Math.round(hours)} hours</span> <input id="track" type="button" value="Track"/></div>`;            
        document.getElementById("track").addEventListener("click", function() {
            let locStg = localStorage.getItem("tsugiStorage");
            if(locStg === null) {
                let titles = [input];
                localStorage.setItem("tsugiStorage", JSON.stringify(titles))
            } else {
                //turn into array
                locStg = JSON.parse(locStg);
                //check if locStg (array) contains input
                let dupeFound = locStg.find(title => title === input);
                if(dupeFound !== input) {
                    locStg.push(input);
                    localStorage.setItem("tsugiStorage", JSON.stringify(locStg));
                } else {
                    alert("already added");
                }
            }
            dataElement.innerHTML = "";
            trackListElem.innerHTML = "";
            populateList();
            console.log(localStorage.getItem("tsugiStorage"));
        })
    }
}

function handleDataLS(data) {
    let TUA = data.data.Media.nextAiringEpisode.timeUntilAiring / 3600;
    let days = TUA / 24;
    let hours = TUA % 24;
    trackListElem.innerHTML += `<div style="border-bottom: 1px lightgray solid; padding-top: 3px;">${data.data.Media.title.english} <span style="color:#72bb53; font-weight:bold;">Episode ${data.data.Media.nextAiringEpisode.episode} airs in ${Math.round(days)} days, ${Math.round(hours)} hours</span></div>`;
}

function handleError(error) {
    if(error.errors[0].status === 404) {
        dataElement.innerHTML = "Anime not found";
    } else {
        dataElement.innerHTML = "An error occurred.";
    }
}
