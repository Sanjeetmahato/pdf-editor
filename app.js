const songs = [

  {
    title: "আগমনী গান ২০২৪",
    category: "agomoni",
    icon: "🌸",
    channel: "SM Studio",
    video: "A9h_Qv1oITc"
  },

  {
    title: "দুর্গাপূজা গান কালেকশন",
    category: "puja",
    icon: "🥁",
    channel: "Bengali Song Official",
    video: "wwViMUglWns"
  },

  {
    title: "এসেছে মা এসেছে",
    category: "agomoni",
    icon: "🌺",
    channel: "SM Studio",
    video: "A9h_Qv1oITc"
  },

  {
    title: "জয় মা জয় দুর্গা",
    category: "bhakti",
    icon: "🙏",
    channel: "SM Studio",
    video: "A9h_Qv1oITc"
  },

  {
    title: "ঢাক বাজা কাঁসর বাজা",
    category: "puja",
    icon: "🥁",
    channel: "Bengali Song Official",
    video: "wwViMUglWns"
  }

];


let currentCategory = "all";


function showSongs(list) {

  const container =
    document.getElementById("songList");

  container.innerHTML = "";


  if (list.length === 0) {

    container.innerHTML = `
      <div style="
        text-align:center;
        padding:50px;
        color:#ffd166;
      ">
        😔 কোনো গান পাওয়া যায়নি
      </div>
    `;

    return;
  }


  list.forEach(song => {

    const card =
      document.createElement("div");

    card.className =
      "song-card";


    card.innerHTML = `

      <div class="song-title">

        <div class="song-icon">
          ${song.icon}
        </div>

        <div>

          <h3>
            ${song.title}
          </h3>

          <span>
            ${song.channel}
          </span>

        </div>

      </div>


      <div class="video">

        <iframe
          src="https://www.youtube.com/embed/${song.video}"
          title="${song.title}"
          allow="
            accelerometer;
            autoplay;
            clipboard-write;
            encrypted-media;
            gyroscope;
            picture-in-picture;
            web-share
          "
          allowfullscreen>
        </iframe>

      </div>

    `;


    container.appendChild(card);

  });

}


function filterSongs(category) {

  currentCategory = category;


  if (category === "all") {

    showSongs(songs);

    return;

  }


  const filtered =
    songs.filter(
      song =>
        song.category === category
    );


  showSongs(filtered);

}


function searchSongs() {

  const query =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();


  let filtered = songs;


  if (currentCategory !== "all") {

    filtered =
      filtered.filter(
        song =>
          song.category ===
          currentCategory
      );

  }


  if (query) {

    filtered =
      filtered.filter(
        song =>
          song.title
            .toLowerCase()
            .includes(query)
      );

  }


  showSongs(filtered);

}


document
  .getElementById("searchInput")
  .addEventListener(
    "input",
    searchSongs
  );


showSongs(songs);
