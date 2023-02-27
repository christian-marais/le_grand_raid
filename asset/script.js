/****************************  variables *****************************/
let macarte;
let text=location.href;
text=text.substring(text.length-4,text.length);
let marqueurs=new L.LayerGroup();//on initialise le groupe de marqueurs

//"https://polenumerique.re/dl/dwwm2021/ws/m1s4/?q=pc";"https://polenumerique.re/dl/dwwm2021/ws/m1s4/?q=top3"
// https://polenumerique.re/dl/dwwm2021/ws/m1s4/photos/photo_5284.png
/***************************Main************************************* */

window.onload=function(){//lance le chargement du sticky-navbar, de la Map et des infos dynamiques au chargement de la page

    $(window).scroll(function () {//charge le sticky-navbar
        if ($(this).scrollTop() > 0) {
            $('.sticky').addClass('sticky-navbar');
            $('#navbarNav').removeClass('nav-link-color');
        } else {
            $('.sticky').removeClass('sticky-navbar');
            $('#navbarNav').addClass('nav-link-color');
        }
    });
    
    initialiserMap("maCarte",-21.10986,55.496164,13);//initialise et génère une carte qui sera insérée dans une balise
    
    // on récupère et traite les données des postes d'étapes
    let afficherLesEtapes=function(){
        marqueurs.clearLayers();
        recupererDonnee(//on recupere les donnees grace à la procedure

        "https://polenumerique.re/dl/dwwm2021/ws/m1s4/?q=pc",
        //on lui passe les fonctions chargés du traitement du résultat
        [ajouterMarqueur,insererElement],  // elle ajoute les marqueurs à la carte et et insère les donnees dans la page html à l'intérieur d'une table
        
        [//on passe les donneesDelaMethode respectifs des fonctions
            ["../images/icon_etape.png",["lat","lon","poste","Altitude","ouverture","fermetureVague1"],"<p>Bienvenue à notre étape</p>",false],
            [["poste","lat","lon", "Altitude"],"demo","tr","td"]
        ]
    );
    }
    let afficherLesCoureurs = function(){
        recupererDonnee(// on utlise une expression de fonction pour initialiser plus tard les données du coureur et les charger dans la page
        "https://polenumerique.re/dl/dwwm2021/ws/m1s4/?q=top3",
        [ajouterMarqueur,insererElement],
        [["../images/icon_coureur.png",["lat","lon","dossard","nom","prenom"],"<p>Coureur classé dans le Top 3</p>",false,true],
        [["dossard","nom","prenom"],"demo","tr","td",true]]  
    );
    }
    // condition qui adapte le contenu en fonction du lien source de la page
    if(text==="top3"){//si on vient du lien top 3 on affiche les données top 3
        afficherLesCoureurs();
        $("#bouton-go").val("Parcours");
        $("#alert").text("Découvrez plus d'informations en consultant le parcours");
    }else{
        afficherLesEtapes();//sinon on affiches les données des étapes
    }
    
    initBouton2Etat("#bouton-go",[afficherLesCoureurs,afficherLesEtapes],["Top 3","Parcours"],"#alert");// on initialise le bouton en lui passant son id, deux fonctions à charger, deux etats de bouton, et la div à modifier
};

/**********************************methodes********************* */
/**
 * M Elle récupère les donnees du JSON et accueille les méthodes qui vont les utiliser avec leur  parametre respectif; respecter l'ordre d'entree de la méthode pour l'ordre d'entréedu paramètre
 * O Rien
 * I String, tableau,tableu
 * @param {String} url 
 * @param {[]} methodes 
 * @param {[]} donneesDelaMethode 
 */
function recupererDonnee(url,methodes,donneesDesMethodes){//recupère les données au format JSON à partir de l'url et passe son resultat à des méthodes qui recevoint d'autres donneesDesMethodes
    //"https://polenumerique.re/dl/dwwm2021/ws/m1s3/"; //"https://polenumerique.re/dl/dwwm2021/ws/m1s4/?q=pc";
    var xhr= new XMLHttpRequest();
    
    xhr.onreadystatechange= function (){
        if(this.readyState!=4 || this.status!=200){//etat pour en cours de chargement qui se charge de l'afficher sur la page avec des spinners
            $("#demo").html('<td class="text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></td><td class="text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></td><td class="text-center"><div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></td>');  
        }
        setTimeout(() => {
            if(this.readyState!=4 || this.status!=200){//etat pour echec de chargement avec message d'erreur sur la page  
                $("#demo").html("<p style='color:orangered'>Le temps de chargement a été trop long. Veuillez recharger la page</p>");
            }   
        }, 10000);
        
        if(this.readyState==4 && this.status==200){//surveille les changements d'états et attends un succès
            elementJson=xhr.response;//transmet la valeur recu en cas de succès
            for(let i=0;i<methodes.length;i++){ //passe aux méthodes leurs donneesDesMethodes respectif qui a été fournie sous forme de tableau
                methodes[i](elementJson,donneesDesMethodes[i]); 
            }   
        }
    }
    xhr.open("GET",url,true);
    xhr.responseType="json";
    xhr.send();
    
};
/**
 * M  génére la map et l'insere dans le container ayant l'ID qui lui a été passé
 * O la variable macarte
 * I 3=4 donneesDelaMethode ci-dessous
 * @param {string} mapId 
 * @param {double} lat 
 * @param {double} lon 
 * @param {int} zoom  
 */
function initialiserMap(mapId,lat,lon,zoom){// elle a besoin de l'id de la div, d'une latitude et longitude pour s'initialiser
    // Créer l'objetDuJson "macarte" et l'insèrer dans l'élément HTML qui a l'ID "map"
    macarte = L.map(mapId).setView([lat, lon], zoom);
    // Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer. Ici, openstreetmap.fr
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        // Il est toujours bien de laisser le lien vers la source des données
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 20
    }).addTo(macarte);
} 

/**
 * Crée un bouton à deux états avec deux actions qui peut également modifier le titre d'un conteneur pour correspondre à l'état
 * @param {string} bouton 
 * @param {[]} methodes 
 * @param {[]} innerTextEtat 
 * @param {String} innerHtmlId 
 */
 function initBouton2Etat(bouton,methodes,innerTextEtat,innerHtmlId){// methodes permettant d'initialiser à la volée des boutons ayant leurs propres méthodes, ou de créer des boutons avec etats
    let texte="Découvrez plus d'informations en consultant le ";//texte qui sera affiché par défaut dans le conteneur
    
    
    $(bouton).click(function(){
        if($(bouton).attr("value")===innerTextEtat[0]){//Si la value du bouton correspond à l'état 0
            if(innerHtmlId){//dans la mesure où on n'a pas de conteneur à modifier le bouton se limite juste à son changement d'état et d'actions
                $(innerHtmlId).html(texte+innerTextEtat[1]);// modifie le html du conteneur
            }
            $(bouton).val(innerTextEtat[1]);//modifie le value du bouton pour le passer en état 1 dont la veleur est l'etat1 donné en parametre
            methodes[0]();//methode à activer
            //-----------personnalisation du header du card-----------------------------
            $("#header-card").text(innerTextEtat[0]); //modification du header de la carte parcours etat0 devient Top3 en etat 1
            //-----------------------------------------------------------
            
        }else{//Si la value du bouton n'est pas égale à l'état 0
            if(innerHtmlId){
                $(innerHtmlId).html(texte+innerTextEtat[0]);
            }
            $(bouton).val(innerTextEtat[0]);
            methodes[1](); 
            //-----------personnalisation du header-----------------------------
            $("#header-card").text(innerTextEtat[1]);
            //-----------------------------------------------------------
        }
    }); 
}

/**
 * M Méthode qui ajoute des marqueur. Elle recoit l'objetDuJson JSON et les donneesDelaMethode du marqueur(iconeUrl,le tableau String de clé du JSON par défaut ["lat","lon","poste"...],la description du Popup par défaut vide )
 * O RIEN
 * I 3 arguments ci-dessous
 * @param {JSON} formatJson 
 * @param {[]} donneesDelaMethode
 * @param {boolean} activerGroupe
 */
function ajouterMarqueur(formatJson,donneesDelaMethode=[[iconeUrl,cleDesValeurs=["lat","lon","poste"],descriptionPopup=""]]){
    //attribue le role de chaque argument
    let iconeUrl=donneesDelaMethode[0];
    let cleDesValeurs=donneesDelaMethode[1];
    let descriptionPopup=donneesDelaMethode[2];
    let activerCluster=donneesDelaMethode[3];
    let personnalisationPopup=false;
   
    //reglage d'activation par défaut du cluster en cas d'absence d'arguments
    if(activerCluster===true){//l'ajout d'un troisieme parametre caché pour valeur égale à false permet une personnalisation désactivant les groupes de marqueurs. Il permet ainsi d'afficher en permanence que les objetDuJsons que l'on souhaite afficher en permanence
        marqueurs=L.markerClusterGroup();
    }else{
        marqueurs=new L.LayerGroup();
    }
    if(donneesDelaMethode[4]===true){//l'ajout d'un quatrième parametre caché pour valeur égale true permet d'activer la personnalisation de la popup de carte. On peut ainsi enrichir les Popups d'un objetDuJson sans modifier celles des autres objetDuJsons. L'utilisation d'un numérique à la place d'un booleen permettrait une personnalisation de davantages d'objetDuJsons
        personnalisationPopup=donneesDelaMethode[4];
    }
    
    //initialise l'icone qui sera utilisée dans la map
    let icone = L.icon({
        iconUrl: iconeUrl,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [-3, -46],
    });
    //--------------création des marqueurs-----------------------------------------------------------
    let marqueur;//déclare la variable marqueur
    let i=0;//i est utilisée pour créer un numéro utilisé pour l'affichage du top dans les popups
    for(let objetDuJson in formatJson){ //ajoute les marqueurs des elements sur la carte à partir du JSON, l'objetDuJson parent est le JSON et objetDuJson est l'objetDuJson métier coureur ou étape
        i++;//valeurs qui sera utilisée comme numéro de top dans la bulle
        marqueur=L.marker([formatJson[objetDuJson][cleDesValeurs[0]],formatJson[objetDuJson][cleDesValeurs[1]]],{icon:icone});//va rechercher dans l'objetDuJson la clé 0,1,2 qui sont la latitude, longitude et le nom
        let texte="";
        
        //-----------------------création des popups des marqueurs--------------------------------
        for(let i=3;i<cleDesValeurs.length;i++){
           
            texte+="<p>"+cleDesValeurs[i]+" : "+formatJson[objetDuJson][cleDesValeurs[i]]+"</p>";// crée les éléments de la bulle à partir du JSON (ex altitude, logitude,...)
        }
        // On crée popups d'affichage des marqueurs
        if(personnalisationPopup){
            marqueur.bindPopup('<div id="no"class="card-body text-center"><img class="profil-pic" src="https://polenumerique.re/dl/dwwm2021/ws/m1s4/photos/photo_'+formatJson[objetDuJson][cleDesValeurs[2]]+'.png" class="card-img-top" alt="..."><h5 class="card-title">N° '+formatJson[objetDuJson][cleDesValeurs[2]]+'</h5><h5>Classé: '+i+'</h5>'+texte+descriptionPopup+'</div>');
        }else{
            marqueur.bindPopup('<div id="no"class="card-body "><h5 class="card-title">'+formatJson[objetDuJson][cleDesValeurs[2]]+'</h5>'+texte+descriptionPopup+'</div>');
        }
        //-------------------------------------------------------------------------------------
            marqueurs.addLayer(marqueur);
            macarte.addLayer(marqueurs);
    }  
} 
/**
 * M Insere les éléments recus dans un tableau dans la page html
 * O rien 
 * I json, tableau de donneesDelaMethode
 * @param {JSON} formatJson 
 * @param {[]} donneesDelaMethode 
 */
function insererElement(formatJson,donneesDelaMethode){//procedure qui insère l'ensemble des données dans la page
    let cles=donneesDelaMethode[0];//clés des valeurs du JSON ex: lat, lon...
    let containerId=donneesDelaMethode[1];//id du conainer ou on va insérer les td
    let baliseParente=donneesDelaMethode[2];//balise th contenant les td 
    let balise=donneesDelaMethode[3];//balise du td 
    let rajoutElements=donneesDelaMethode[4];// booleen qui dit si on rajoute ou non des éléments
    let container=document.getElementById(containerId);// on selectionne le conteneur des nouveaux éléments html
    container.innerHTML=""; // on le vide en début de méthode
    let newElementHtml= []; // tableau elements html destinés à contenir les tr créés
    let newSousElementHtml=[];//tableau element html -idem- td créés

    //---------------personnalisation du tHeader du tableau, on rajoute les colonnes classement et photo-------------
    if(!rajoutElements){ //version normale
        $("#titre").html('<th scope="col">'+cles[0]+'</th><th scope="col">Latitude</th><th scope="col">Longitude</th><th scope="col">Altitude</th>') 
    }else{
        let texte="";
        for(cle of cles){
            texte+='<th scope="col">'+cle+'</th>'; 
        }
        $("#titre").html('<th scope="col">#</th><th scope="col"></th>'+texte);
    }

    let p=1;
    for (let objetDuJson in formatJson){ //Crée les lignes du tableau
        
        newElementHtml[objetDuJson]=document.createElement(baliseParente);//on crée la ligne qui va accueillir les cellules contenant les infos
        container.appendChild(newElementHtml[objetDuJson]); //on insere la ligne dans le corps du tableau 

        let i=0;
        //--------------rajout de cellule dans une ligne. On fait un rajout de code personnalisé à cette demande étant donné que les elements ne sont pas des elements du fichier Json de base---------------------------------
        if(rajoutElements){
            //------------------------- rajout du numéro de classement ----------------------
            
            newSousElementHtml[i]=document.createElement(balise);//on ajoute la cellule supplémentaire contenant la photo en premier
            newElementHtml[objetDuJson].appendChild(newSousElementHtml[i]); // on l'affecte à la ligne tr   
            newSousElementHtml[i].innerHTML='<span>'+p+'</span>';  
            //----------------------------- rajout de la photo du coureur------------------------
            newSousElementHtml[i]=document.createElement(balise);//on ajoute la cellule supplémentaire contenant la photo en premier
            newElementHtml[objetDuJson].appendChild(newSousElementHtml[i]); // on l'affecte à la ligne tr   
            newSousElementHtml[i].innerHTML='<img class="profil-pic" src="https://polenumerique.re/dl/dwwm2021/ws/m1s4/photos/photo_'+formatJson[objetDuJson]["dossard"]+'.png"/>';
         //--------------------------------------------------------------------------------   
            
        }
        //-------------------on créé les HTML td du tableau automatiquement à partir du JSON--------------------
        for(let cle of cles){ //idem crée une ligne du tableau avec les cellules contenant les éléments
            newSousElementHtml[i]=document.createElement(balise);
            newElementHtml[objetDuJson].appendChild(newSousElementHtml[i]);
            // ---------------on en profite pour créer des boutons dans le tableau qui vont permettre de centrer le coureur ou l'étape sur la map-------------
            if (cle===cles[0]){// on crée le lien sur le numéro de dossard clé[0]
                newSousElementHtml[i].innerHTML='<a class=" badge bg-tertiaire"type="button" href="#maCarte" id="centrer'+i+'">'+formatJson[objetDuJson][cle]+'</a>';
                newSousElementHtml[i].addEventListener(//on ajoute un écouteur d'évènements
                    "click",
                    function(){
                        macarte.setView([formatJson[objetDuJson]["lat"],formatJson[objetDuJson]["lon"],20]);// Méthode qui centre sur la map
                    },
                    false
                );
                
            }else{
                newSousElementHtml[i].innerText=formatJson[objetDuJson][cle];
            }
            i++;   
        }  
        p++;//p s'inscrémente à chaque fois qu'une ligne est créé,c'est à dire qu'on passe à l'objetDuJson suivant
    }  
}

