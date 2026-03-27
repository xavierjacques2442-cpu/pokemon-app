"use client";

import React, { useState, useEffect} from "react";

type Pokemon = {
  id: number;
  name: string;
  sprites: any;
  types: {type: {name: string} } [];
  moves: {move: {name: string}} [];
  abilities: {ability: {name: string}} [];
  species: { url: string}
  location_area_encounters: string
};

export default function Page() {

    const [pokemon, setPokemon ] = useState<Pokemon | null>(null);
    const [shiny, SetShiny] = useState(false);
    const [showfavorites, setShowFavorites] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [locations, setLocations] = useState<string>("N/A");
    const [evolution, setEvolution] = useState<string[]>([]);
    const [openFavorites, setOpenFavorites] = useState(false);
    const [evolutionSprites, setEvolutionSprites] = useState<string[]>([]);


    useEffect(() => {
      const stored = localStorage.getItem("favorites");
      if (stored) setShowFavorites(JSON.parse(stored));
    },
    []);

    async function fetchPokemon(nameOrId: string | number) {
     try {
      const res =  await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
       const data: Pokemon = await res.json();

       setPokemon(data);
       SetShiny(false);

       fetchEvolution(data.species.url);
       fetchLocation(data.location_area_encounters);

    } catch {
      alert("Pokemon not found")
    }
  }

  async function fetchLocation(url: string) {
    const res = await fetch(url);
    const locData = await res.json();

    setLocations(locData.length ? locData[0].location_area.name : "N/A"
    );
  }

  async function fetchEvolution(speciesUrl: string) {
    const res = await fetch (speciesUrl);
    const species =await res.json();
  

  const evoRes = await fetch(species.evolution_chain.url);
  const evoData = await evoRes.json();

  const evoList: string[] = [];
   let node = evoData.chain;
   while (node) {
    evoList.push(node.species.name);
    node = node.evolves_to[0];
   }

   const evoSprites: string[] = [];

for (const evoName of evoList) {
  const evoRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`);
  const evoData = await evoRes.json();
  evoSprites.push(evoData.sprites.other["official-artwork"].front_default);
}

setEvolutionSprites(evoSprites);


   setEvolution(evoList);
  }


  function toggleFavorite() {
    if (!pokemon) return;

 const name = pokemon.name;
 const update = showfavorites.includes(name)
 ? showfavorites.filter(f => f != name)
 : [...showfavorites, name];

 setShowFavorites(update);
 localStorage.setItem("favorites", JSON.stringify(update));
  }
 function toggleFavoriteFromList(name: string) {
  const update = showfavorites.includes(name)
    ? showfavorites.filter(f => f !== name)
    : [...showfavorites, name];

  setShowFavorites(update);
  localStorage.setItem("favorites", JSON.stringify(update));


}
  

  return(
    <div className="min-h-screen bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('/images/Background.png')"}}
    >
<div className="min-h-screen flex flex-col items-center p-3 md:p-6 space-y-4 md:space-y-6">

<section
id="SearchBarContext"
className="flex bg-white/80 rounded-2x1 shadow-x1 overflow-hidden w-full max-w-[1100px] h-[55px] md:h-[65px]">

  <div id="favoriteBtn"
  className="border-r px-3 md:px-5 flex items-center cursor-pointer"
   onClick={() => setOpenFavorites(true)}
   >
    <img src="/images/FavoriteList.png" className="w-6 md:w-8"/>
  </div>

  <div id="randomBtn"
  className="border-r px-3 md:px-5 flex items-center cursor-pointer"
  onClick={ ()=> fetchPokemon(Math.floor(Math.random() * 649) + 1)}
  >
<img src="/images/Random.png" className="w-6 md:w-8" />
  </div>

<div className="flex-1 px-3 md:px-5 ">
<input
id="userInput"
type="text"
placeholder="Search Pokemon...."
className="w-full bg-transparent outline-none text-lg md:text-2xl text-gray-950" 
value={input}
onChange={e => setInput(e.target.value)}
onKeyDown={e => e.key === "Enter" && fetchPokemon(input)}
/>
</div>

<div id="EnterBtn"
  className="border-1 px-3 md:px-5 flex items-center cursor-pointer" 
  onClick={() => fetchPokemon(input)}
  >
    <img src="/images/Search.png" className="w-6 md:w-8"/>
</div>
</section>

 {pokemon && (
          <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-[1100px] p-4 md:p-8 space-y-5 overflow-y-auto">
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
             <img
  src={
    pokemon && showfavorites.includes(pokemon.name)
      ? "/images/Blackstar.png"
      : "/images/star.png"
  }
  className="w-8 md:w-12 cursor-pointer"
  onClick={toggleFavorite}
/>

              <h2 id="pokemonName" className="text-3xl md:text-5xl font-bold capitalize text-gray-950">
                {pokemon.name}
              </h2>

              <span id="pokedexNumber" className="text-xl md:text-3xl text-gray-950">
                #{pokemon.id}
              </span>
            </div>

            <div className="flex flex-col items-center space-y-2 md:space-y-3">
  <img
    id="mainImg"
    src={
      shiny
        ? pokemon.sprites.other["official-artwork"].front_shiny
        : pokemon.sprites.other["official-artwork"].front_default
    }
    onClick={() => SetShiny(!shiny)}
    className="w-40 h-40 md:w-64 object-contain cursor-pointer"
  />

  <p id="form" className="text-lg md:text-xl text-gray-950">
    From: {shiny ? "Shiny" : "Default"}
  </p>
</div>


            <div
              id="types"
              className="flex justify-center flex-wrap gap-2 md:gap-4 text-lg md:text-xl font-semibold"
            >
              {pokemon.types.map(t => (
                <span key={t.type.name} className="capitalize text-gray-950">
                  {t.type.name}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div
                id="evolution"
                className="bg-green-200/70 rounded-xl p-3 md:p-4 text-sm md:text-base md:col-span-2"
              >
               
            <p className="text-gray-950 mb-4 text-lg md:text-xl">Evolution:</p>
             <div className="flex items-center gap-4">
  {evolutionSprites.map((src, i) => (
    <div key={i} className="flex flex-col items-center">
      <img src={src} className="w-20 h-20 object-contain" />
      <span className="capitalize text-center text-gray-950">{evolution[i]}</span>
    </div>
  ))}
</div>

              </div>

              <div
                id="moves"
                className="bg-blue-200/70 rounded-xl p-3 md:p-4 text-sm md:text-base max-h-40 md:max-h-60 overflow-y-auto text-gray-950"
              >
                Moves: {pokemon.moves.slice(0, 20).map(m => m.move.name).join(", ")}
              </div>

              <div
                id="abilities"
                className="bg-yellow-200/70 rounded-xl p-3 md:p-4 text-sm md:text-base text-gray-950"
              >
                Abilities: {pokemon.abilities.map(a => a.ability.name).join(", ")}
              </div>

              <div
                id="locations"
                className="bg-red-200/70 rounded-xl p-3 md:p-4 text-sm md:text-base md:col-span-2 max-h-40 md:max-h-60 overflow-y-auto text-gray-950"
              >
                Location: {locations}
              </div>
            </div>
          </section>
        )}

<div id="favoritesPanel"
className={`fixed top-0 left-0 h-full w-64
bg-black/70 backdrop-blur-md text-white p-4
transform transition-transform duration-300 z-50
${openFavorites ? "translate-x-0" : "-translate-x-full"}`}>


  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">Favorites</h2>

    <img id="closeFavorites"
    src="images/XOut.png"
    className="w-8 cursor-pointer" 
    onClick={() => setOpenFavorites(false)}
    />

  </div>

  <ul id="favoritesList" className="space-y-3">
    {showfavorites.map((f) => (
      <li
        key={f}
        onClick={() => fetchPokemon(f)}
        className="cursor-pointer flex justify-between items-center"
      >
        <span className="capitalize">{f}</span>

        <img
    src={
    pokemon && showfavorites.includes(f)
      ? "/images/Blackstar.png"
      : "/images/star.png"
  }
  className="w-8 md:w-12 cursor-pointer"
  onClick={(e) => {
    e.stopPropagation();        
    toggleFavoriteFromList(f); 
  }}
        />
      </li>
    ))}
  </ul>
</div>
</div>
</div>
      );
    }
  
