const mealsEl = document.querySelector('.meals')
const favoriteContainer = document.querySelector('.fav-meals')
const mealPopup = document.getElementById('meal-popup')
const mealInfoEl = document.getElementById('meal-info')
const popupCloseBtn = document.getElementById('close-popup')

const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')

getRandomMeal()
fetchFavMeals()

async function getRandomMeal() {
	const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
	const respData = await resp.json()
	const randomMeal = respData.meals[0]

	addMeal(randomMeal, true)
}

async function getMealById(id) {
	const resp = await fetch(
		'https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id,
	)

	const respData = await resp.json()

	const meal = respData.meals[0]

	return meal
}

async function getMealBySearch(term) {
	const resp = await fetch(
		'https://www.themealdb.com/api/json/v1/1/search.php?s=' + term,
	)

	const respData = await resp.json()
	const meals = respData.meals

	return meals
}

function addMeal(mealData, random = false) {
	console.log(mealData)

	const meal = document.createElement('div')
	meal.classList.add('meal')

	meal.innerHTML = `
        <div class="meal-header">
            ${
							random
								? `
            <span class="random"> Random Recipe </span>`
								: ''
						}
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `

	const btn = meal.querySelector('.fav-btn')

	btn.addEventListener('click', () => {
		if (btn.classList.contains('active')) {
			removeMealLS(mealData.idMeal)
			btn.classList.remove('active')
		} else {
			addMealLS(mealData.idMeal)
			btn.classList.add('active')
		}

		fetchFavMeals()
	})

	meal.addEventListener('click', () => {
		showMealInfo(mealData)
	})

	mealsEl.appendChild(meal)
}

function addMealLS(mealId) {
	const mealIds = getMealsLS()

	localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
}

function removeMealLS(mealId) {
	const mealIds = getMealsLS()

	localStorage.setItem(
		'mealIds',
		JSON.stringify(mealIds.filter((id) => id !== mealId)),
	)
}

function getMealsLS() {
	const mealIds = JSON.parse(localStorage.getItem('mealIds'))

	return mealIds === null ? [] : mealIds
}

function clearLS() {
	localStorage.removeItem('mealIds')
	window.location.reload()
}

async function fetchFavMeals() {
	favoriteContainer.innerHTML = ''
	const mealIds = getMealsLS()

	for (let i = 0; i < mealIds.length; i++) {
		const mealId = mealIds[i]

		meal = await getMealById(mealId)

		addMealToFav(meal)
	}
}

function addMealToFav(mealData) {
	//
	const favMeal = document.createElement('li')

	favMeal.innerHTML = `
		<img
			src="${mealData.strMealThumb}"
			alt="${mealData.strMeal}""
		/><span>${mealData.strMeal}</span>
    `

	favMeal.addEventListener('click', () => {
		showMealInfo(mealData)
	})

	favoriteContainer.appendChild(favMeal)
}

const clear_btn = document.querySelector('.clean-fav')

clear_btn.addEventListener('click', clearLS)

//show meal info
function showMealInfo(mealData) {
	// clean it up
	mealInfoEl.innerHTML = ''

	//Update Meal Info
	const mealEl = document.createElement('div')

	//get ingrediants and measures

	//console.log(mealData['strIngredient1'])
	const ingrediants = []
	for (let i = 1; i <= 20; i++) {
		if (mealData['strIngredient' + i]) {
			ingrediants.push(
				`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`,
			)
		} else {
			break
		}
	}

	mealEl.innerHTML = `
					<h1>${mealData.strMeal}</h1>
					<img
						src="${mealData.strMealThumb}"
						alt=""
					/>

					<p>
					${mealData.strInstructions}
					</p>
					<h3>Ingrediants</h3>
					<ul>
						${ingrediants
							.map(
								(ing) => `
						<li>${ing}</li>
						`,
							)
							.join('')}
					</ul>
	`
	mealInfoEl.appendChild(mealEl)

	//show the popup
	mealPopup.classList.remove('hidden')
}

searchBtn.addEventListener('click', async () => {
	//clean container
	mealsEl.innerHTML = ''
	const search = searchTerm.value

	const meals = await getMealBySearch(search)

	if (meals) {
		meals.forEach((meal) => {
			addMeal(meal)
		})
	} else {
		getRandomMeal()
		alert('The search items are not available')
	}
})

popupCloseBtn.addEventListener('click', () => {
	mealPopup.classList.add('hidden')
})
