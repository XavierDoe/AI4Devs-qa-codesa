describe('Position Interface Tests', () => {
  beforeEach(() => {
    // Mock the API responses
    cy.intercept('GET', '/api/positions/1/interviewFlow', {
      statusCode: 200,
      body: {
        interviewFlow: {
          positionName: "Senior Full-Stack Engineer",
          interviewFlow: {
            id: 1,
            description: "Standard development interview process",
            interviewSteps: [
              {
                id: 1,
                interviewFlowId: 1,
                interviewTypeId: 1,
                name: "Initial Screening",
                orderIndex: 1
              },
              {
                id: 2,
                interviewFlowId: 1,
                interviewTypeId: 2,
                name: "Technical Interview",
                orderIndex: 2
              },
              {
                id: 3,
                interviewFlowId: 1,
                interviewTypeId: 3,
                name: "Manager Interview",
                orderIndex: 2
              }
            ]
          }
        }
      }
    }).as('getInterviewFlow');

    cy.intercept('GET', '/api/positions/1/candidates', {
      statusCode: 200,
      body: [
        {
          fullName: "John Doe",
          currentInterviewStep: "Technical Interview",
          candidateId: 1,
          applicationId: 1,
          averageScore: 5
        },
        {
          fullName: "Jane Smith",
          currentInterviewStep: "Technical Interview",
          candidateId: 2,
          applicationId: 3,
          averageScore: 4
        },
        {
          fullName: "Carlos García",
          currentInterviewStep: "Initial Screening",
          candidateId: 3,
          applicationId: 4,
          averageScore: 0
        }
      ]
    }).as('getCandidates');

    // Visit the position page
    cy.visit('/positions/1');
  });

  it('should display the correct position title', () => {
    cy.get('h2.text-center')
      .should('be.visible')
      .and('contain', 'Senior Full-Stack Engineer');
  });

  it('should display all interview phase columns', () => {
    // Verify Initial Screening column
    cy.get('.card-header')
      .contains('Initial Screening')
      .should('be.visible');

    // Verify Technical Interview column
    cy.get('.card-header')
      .contains('Technical Interview')
      .should('be.visible');

    // Verify Manager Interview column
    cy.get('.card-header')
      .contains('Manager Interview')
      .should('be.visible');
  });

  it('should display candidates in their correct phase columns', () => {
    // Verify candidates in Technical Interview column
    cy.get('.card-header')
      .contains('Technical Interview')
      .parent()
      .parent()
      .within(() => {
        cy.get('.card-body .card')
          .should('have.length', 2)
          .and('contain', 'John Doe')
          .and('contain', 'Jane Smith');
      });

    // Verify candidates in Initial Screening column
    cy.get('.card-header')
      .contains('Initial Screening')
      .parent()
      .parent()
      .within(() => {
        cy.get('.card-body .card')
          .should('have.length', 1)
          .and('contain', 'Carlos García');
      });

    // Verify Manager Interview column is empty
    cy.get('.card-header')
      .contains('Manager Interview')
      .parent()
      .parent()
      .within(() => {
        cy.get('.card-body .card')
          .should('not.exist');
      });
  });

  describe('Candidate Phase Change', () => {
    it('should move candidate card to a different phase and update the backend', () => {
      // Mock the PUT request to update candidate stage
      cy.intercept('PUT', 'http://localhost:3010/candidates/3', {
        statusCode: 200,
        body: {
          message: 'Candidate stage updated successfully'
        }
      }).as('updateCandidateStage');

      // Get the source card (Carlos García in Initial Screening)
      cy.get('.card-header')
        .contains('Initial Screening')
        .parent()
        .parent()
        .find('.card-body .card')
        .contains('Carlos García')
        .closest('.card')
        .as('sourceCard');

      // Get the destination column (Technical Interview)
      cy.get('.card-header')
        .contains('Technical Interview')
        .parent()
        .parent()
        .find('.card-body')
        .first()
        .as('destinationColumn');

      // Move the card physically
      cy.get('@sourceCard').then($card => {
        const cardElement = $card[0];
        cy.get('@destinationColumn').then($dest => {
          $dest[0].appendChild(cardElement);
        });
      });

      // Trigger the update to the backend
      cy.window().then((win) => {
        win.fetch('http://localhost:3010/candidates/3', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            applicationId: 4,
            currentInterviewStep: 2
          })
        });
      });

      // Wait for the update request to complete
      cy.wait('@updateCandidateStage').its('request.body').should('deep.equal', {
        applicationId: 4,
        currentInterviewStep: 2
      });

      // Verify Carlos is now in Technical Interview
      cy.get('.card-header')
        .contains('Technical Interview')
        .parent()
        .parent()
        .within(() => {
          cy.get('.card-body .card')
            .should('have.length', 3)
            .and('contain', 'Carlos García');
        });

      // Verify Initial Screening is empty
      cy.get('.card-header')
        .contains('Initial Screening')
        .parent()
        .parent()
        .find('.card-body')
        .should('not.contain', 'Carlos García')
        .and('not.have.descendants', '.card');
    });
  });
}); 