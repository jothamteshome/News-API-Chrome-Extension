const newsCategories = ["business", "entertainment", "general", "health", "science", "sports", "technology"];

const populateCategorySection = function (section, articles) {
    for (const article of articles) {
        // Create article section
        const articleSection = document.createElement('div');
        articleSection.classList.add('articleSection');


        // Create article title and add url to article
        const articleTitle = document.createElement('a');
        articleTitle.classList.add('articleTitle');
        articleTitle.textContent = article.title;
        articleTitle.href = article.url;
        articleTitle.target = "_blank";
        articleSection.appendChild(articleTitle);


        // Add author and date published to same line
        const articleAuthor = document.createElement('h3');
        articleAuthor.classList.add('articleAuthor');
        articleSection.appendChild(articleAuthor);

        if (article.author) {
            articleAuthor.textContent = `${article.author} - `;
        }

        // Adding published date
        const publishDate = new Date(article.publishedAt);
        const publishDateComponents = publishDate.toDateString().split(' ');
        const formattedDate = `${publishDateComponents[0]}, 
                                ${publishDateComponents[1]} ${publishDateComponents[2]}, 
                                ${publishDateComponents[3]}`

        articleAuthor.textContent = `${articleAuthor.textContent}${formattedDate}`;


        // Add image url for article
        if (article.urlToImage) {
            const articleImageContainer = document.createElement('div');
            articleImageContainer.classList.add('articleImageContainer');

            const articleImage = document.createElement('img');
            articleImage.alt = article.description ? article.description : article.title;
            articleImage.src = article.urlToImage;

            articleImageContainer.appendChild(articleImage);
            articleSection.appendChild(articleImageContainer);
        }


        // Add article content text to article section
        const articleTextContainer = document.createElement('p');
        articleTextContainer.classList.add('articleTextContainer');
        articleTextContainer.textContent = article.content;
        articleSection.appendChild(articleTextContainer);

        section.appendChild(articleSection);
    }
}

const retrieveNewsContent = function (category, section) {
    const requestURL = `http://127.0.0.1:8989/retrieveNewsContent/${category}/us`;

    const request = new Request(requestURL);

    // Fetch news content from dedicated server
    fetch(request).then((response) => {
        response.json().then((returnedObject) => {
            populateCategorySection(section, returnedObject.articles);
        });
    });
}


const toggleDisplayArrow = function(event) {
    const target = event.currentTarget;

    const sectionOpen = target.getAttribute('section-open') !== "false";
    const arrow_img = target.querySelector('img');
    
    const section_content = document.getElementById(`${target.getAttribute('section-name')}-content`);
    section_content.classList.toggle('hideNews');

    switch (sectionOpen) {
        case true:
            target.setAttribute("section-open", "false");
            arrow_img.style.transform = "rotate(0deg)";
            section_content.style.maxHeight = "0px";
            break;
        
        default:
            target.setAttribute("section-open", "true");
            arrow_img.style.transform = "rotate(90deg)";
            section_content.style.maxHeight = `${1000 * section_content.children.length}px`;
            break;
    }
}

const buildCategories = function () {
    const contentSection = document.querySelector('.content');

    for (const category of newsCategories) {
        const titleCase = `${category[0].toUpperCase()}${category.slice(1)}`;

        // Main section that is revealed when dropdown button is pressed
        const section = document.createElement('div');
        section.classList.add('section');


        // Create header content row
        const sectionHeaderRow = document.createElement('div');
        sectionHeaderRow.classList.add('sectionHeaderRow');


        // Create arrow and arrow image
        const arrow = document.createElement('div');
        arrow.classList.add('arrow');
        arrow.setAttribute('section-name', category);
        arrow.setAttribute('section-open', "false");
        arrow.addEventListener('click', toggleDisplayArrow);

        const arrow_img = document.createElement('img');
        arrow_img.alt = "Arrow pointing right";
        arrow_img.loading = "lazy";
        arrow_img.src = "../assets/section-arrow.png";

        arrow.appendChild(arrow_img);


        // Create section header
        const sectionHeader = document.createElement('div');
        sectionHeader.classList.add('sectionHeader');
        sectionHeader.textContent = titleCase;


        // Add header contents to header content row
        sectionHeaderRow.appendChild(arrow);
        sectionHeaderRow.appendChild(sectionHeader);


        // Add header content row to content section
        section.appendChild(sectionHeaderRow);

        const sectionNews = document.createElement('div');
        sectionNews.classList.add('sectionNews');
        sectionNews.classList.add('hideNews');
        sectionNews.id = `${category}-content`;


        // Populate news sections with articles
        retrieveNewsContent(category, sectionNews);

        section.appendChild(sectionNews);

        contentSection.appendChild(section);
    }
}


window.addEventListener('load', buildCategories);