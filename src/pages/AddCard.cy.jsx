import React from 'react'
import AddCard from './AddCard'

Cypress.Commands.add('alertErrorHaveText', (expectedText) => {
  cy.contains('.alert-error', expectedText)
    .should('be.visible')
})

Cypress.Commands.add('fillCardForm', (card) => {
  cy.get('[data-cy="number"]').type(card.number)
  cy.get('[data-cy="holderName"]').type(card.holderName)
  cy.get('[data-cy="expirationDate"]').type(card.expirationDate)
  cy.get('[data-cy="cvv"]').type(card.cvv)
  cy.get(`[data-cy="bank-${card.bank}"]`).click()
})

Cypress.Commands.add('submitCardForm', () => {
  cy.get('[data-cy="saveMyCard"]').click()
})

describe('<AddCard />', () => {
   const myCard = {
      number: '4242424242424242',
      holderName: 'Fernando Papito',
      expirationDate: '12/29',
      cvv: '737',
      bank: 'neon'
    }
  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.mount(<AddCard />)
  })
  it('exibe erros para campos não informados', () => {
    // see: https://on.cypress.io/mounting-react

    cy.submitCardForm()

    // cy.alertErrorHaveText('Número do cartão é obrigatório')
    // cy.alertErrorHaveText('Nome do titular é obrigatório')
    // cy.alertErrorHaveText('Data de expiração é obrigatória')
    // cy.alertErrorHaveText('CVV é obrigatório')
    // cy.alertErrorHaveText('Selecione um banco')

    const alerts = [
      'Número do cartão é obrigatório',
      'Nome do titular é obrigatório',
      'Data de expiração é obrigatória',
      'CVV é obrigatório',
      'Selecione um banco'
    ]

    alerts.forEach((alert) => {
      cy.alertErrorHaveText(alert)
    })

    // cy.contains('.alert-error','Número do cartão é obrigatório').should('be.visible')
    // cy.contains('.alert-error','Nome do titular é obrigatório').should('be.visible')
    // cy.contains('.alert-error','Data de expiração é obrigatória').should('be.visible')
    // cy.contains('.alert-error','CVV é obrigatório').should('be.visible')
    // cy.contains('.alert-error','Selecione um banco').should('be.visible')

  })
  it('deve cadastrar um novo cartão de crédito', () => {
    cy.fillCardForm(myCard)

    cy.intercept('POST', 'http://wallet.cardfify.dev/api/cards', (req) => {
      req.reply({
        statusCode: 201,
        body: myCard
      })
    }).as('addCard')

    cy.submitCardForm()

    cy.wait('@addCard')

    cy.get('.notice-success')
      .should('be.visible')
      .and('have.text', 'Cartão cadastrado com sucesso!')
  })

  it('valida nome do titular com nome contendo menos que 2 caracteres', () => {
    cy.fillCardForm({...myCard , holderName: 'F'})
    cy.submitCardForm()
    cy.alertErrorHaveText('Nome deve ter pelo menos 2 caracteres')

  })
  it('validar data de expiracão invalida', () => {
    cy.fillCardForm({...myCard , expirationDate:'22/35'})
    cy.submitCardForm()

    cy.alertErrorHaveText('Data de expiração inválida ou vencida')
  })
  it('valida cvv contendo menos que 3 caracteres', () => {
   
    cy.alertErrorHaveText('Data de expiração inválida ou vencida')

  })
  it('valida CVV com menos de 3 dígitos', () => {
    cy.fillCardForm({...myCard , cvv:'7'})
    cy.submitCardForm()

    cy.alertErrorHaveText('CVV deve ter 3 ou 4 dígitos')
  })
})
