// @flow

import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Card, Container, Dropdown, Grid, Header, Icon, Image, Modal, Table } from 'semantic-ui-react';
import styled from 'styled-components';

import { allowVotes, changeComplete, changeRound, deleteBracket } from 'state/bracket';
import { getBrackets, ungetBrackets } from 'state/brackets';
import withAuthorization from 'hoc/withAuthorization';

const BracketButton = styled(Button)`
  &&& {
    text-align: left;
    margin-bottom: ${5 / 16}rem;
  }
`;

const BracketCard = styled(Card)`
  &&& {
    width: ${500 / 16}rem;
  }
`;

const BracketCardContent = styled(Card.Content)`
  &&& {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
`;

const BracketCardImage = styled(Image)`
  &&& {
    position: absolute;
    top: ${10 / 16}rem;
    right: ${10 / 16}rem;
  }
`;

const ErrorText = styled.span`
  display: inline-block;
  font-size: ${12 / 16}rem;
  color: red;
  padding: ${4 / 16}rem;
`;

const GridColumn = styled(Grid.Column)`
  &&&& {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

class DeleteBracketModal extends React.Component<
  { authUser: Object | null, bracket: Object, deleteBracket: Function },
  { modalOpen: boolean, error: Object | null }
> {
  state = { modalOpen: false, error: null };

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () => this.setState({ modalOpen: false });

  deleteBracket = bracketId => {
    const { authUser } = this.props;

    this.props.deleteBracket(authUser, bracketId);
  };

  render() {
    const { error } = this.state;
    const { bracket: { name, id } } = this.props;

    return (
      <Modal
        open={this.state.modalOpen}
        onClose={this.handleClose}
        trigger={
          <BracketButton negative onClick={this.handleOpen}>
            Delete
          </BracketButton>
        }
        size="small">
        <Header icon="user delete" content={`Delete ${name}`} />
        <Modal.Content>
          <p>{`Are you sure you want to delete bracket "${name}"? This action is not reversible`}</p>

          {error && <ErrorText>{error.message}</ErrorText>}
        </Modal.Content>
        <Modal.Actions>
          <Button color="red" inverted onClick={this.handleClose}>
            <Icon name="remove" /> No
          </Button>
          <Button
            color="green"
            inverted
            onClick={() => {
              this.deleteBracket(id);
              this.handleClose();
            }}>
            <Icon name="checkmark" /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

class Brackets extends React.Component<{
  authUser: Object | null,
  brackets: Array<Object>,
  allowVotes: Function,
  changeComplete: Function,
  changeRound: Function,
  deleteBracket: Function,
  getBrackets: Function,
  ungetBrackets: Function
}> {
  componentWillReceiveProps(nextProps) {
    nextProps.authUser && !this.props.authUser && this.props.getBrackets(nextProps.authUser);
  }

  componentDidMount() {
    const { authUser } = this.props;

    authUser && this.props.getBrackets(authUser);
  }

  componentWillUnmount() {
    const { authUser } = this.props;

    authUser && this.props.ungetBrackets(authUser);
  }

  deleteBracket = bracketId => {
    const { authUser } = this.props;

    this.props.deleteBracket(authUser, bracketId);
  };

  completeBracket = ({ id, user_id }) => this.props.changeComplete(id, user_id);

  cloneBracket = bracketId => {
    console.log(bracketId);
  };

  render() {
    const { authUser, brackets } = this.props;

    return (
      <Container>
        <Header as="h1">My Brackets</Header>
        <Grid columns={2} container doubling stretched stackable>
          {brackets &&
            brackets.map(b => (
              <GridColumn key={b.id}>
                <BracketCard>
                  <Card.Content>
                    <BracketCardImage size="tiny" src={b.seeds[0].image} />
                    <Card.Header as="h4">{b.name}</Card.Header>
                    <Card.Meta>{new Date(b.created).toUTCString()}</Card.Meta>
                    <Card.Description>
                      <Table singleLine striped fixed unstackable basic="very" size="small" columns={2}>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell>Number of seeds:</Table.Cell>
                            <Table.Cell>{b.size}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>Current round:</Table.Cell>
                            <Table.Cell>{b.round}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>Complete:</Table.Cell>
                            <Table.Cell>{`${b.complete}`}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>Change Round:</Table.Cell>
                            <Table.Cell style={{ overflow: 'visible' }}>
                              <Dropdown
                                disabled={b.complete}
                                defaultValue={b.round}
                                placeholder="Change Round"
                                onChange={(e, { value }) => this.props.changeRound(b.id, b.user_id, value)}
                                options={Array.from(
                                  new Array(Math.floor(Math.log2(b.seeds.length))),
                                  (_, i) => i + 1
                                ).map(e => ({ text: e, value: e }))}
                              />
                            </Table.Cell>
                          </Table.Row>
                          {!b.complete && (
                            <Table.Row>
                              <Table.Cell>Allow voting:</Table.Cell>
                              <Table.Cell style={{ overflow: 'visible' }}>
                                <Dropdown
                                  disabled={b.complete}
                                  defaultValue={b.allowVotes ? 'true' : 'false'}
                                  placeholder="Allow Votes"
                                  onChange={(e, { value }) => this.props.allowVotes(b.id, b.user_id, value === 'true')}
                                  options={[{ text: 'true', value: 'true' }, { text: 'false', value: 'false' }]}
                                />
                              </Table.Cell>
                            </Table.Row>
                          )}
                        </Table.Body>
                      </Table>
                    </Card.Description>
                  </Card.Content>
                  <BracketCardContent extra>
                    <BracketButton onClick={() => this.cloneBracket(b.id)} disabled>
                      Clone
                    </BracketButton>
                    <BracketButton as={Link} to={`/brackets/${b.id}`}>
                      View
                    </BracketButton>
                    <BracketButton positive onClick={() => this.completeBracket(b)} disabled={b.complete}>
                      Complete
                    </BracketButton>
                    <DeleteBracketModal authUser={authUser} bracket={b} deleteBracket={this.props.deleteBracket} />
                  </BracketCardContent>
                </BracketCard>
              </GridColumn>
            ))}
        </Grid>
      </Container>
    );
  }
}

export default withAuthorization(
  connect(
    state => ({
      authUser: state.auth.authUser,
      brackets: state.brackets
    }),
    { allowVotes, changeComplete, changeRound, deleteBracket, getBrackets, ungetBrackets }
  )(Brackets)
);
