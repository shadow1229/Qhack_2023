import json
import pennylane as qml
import pennylane.numpy as np

def create_Hamiltonian(h):
    """
    Function in charge of generating the Hamiltonian of the statement.

    Args:
        h (float): magnetic field strength

    Returns:
        (qml.Hamiltonian): Hamiltonian of the statement associated to h
    """

    # Put your code here #
    coeffs = []
    obs    = []
    num_wires=4
    #XiXj terms
    for i in range(num_wires-1):
        coeffs.append(-1)
        obs.append(qml.PauliZ(i) @ qml.PauliZ(i+1))
        
    coeffs.append(-1)
    obs.append(qml.PauliZ(num_wires-1) @ qml.PauliZ(0))
    
    for i in range(num_wires):
        coeffs.append(-1*h)
        obs.append(qml.PauliX(i))
    H = qml.Hamiltonian(coeffs, obs)
    return H
    
    
dev = qml.device("default.qubit", wires=4)

@qml.qnode(dev)
def model(params, H):
    """
    To implement VQE you need an ansatz for the candidate ground state!
    Define here the VQE ansatz in terms of some parameters (params) that
    create the candidate ground state. These parameters will
    be optimized later.

    Args:
        params (numpy.array): parameters to be used in the variational circuit
        H (qml.Hamiltonian): Hamiltonian used to calculate the expected value

    Returns:
        (float): Expected value with respect to the Hamiltonian H
    """
    # Put your code here #
    qml.templates.QAOAEmbedding(features=[1.,2.,3.,4.], weights=params, wires=dev.wires)

    # Put your code here #
    return qml.expval(H)
    
def train(h):
    """
    In this function you must design a subroutine that returns the
    parameters that best approximate the ground state.

    Args:
        h (float): magnetic field strength

    Returns:
        (numpy.array): parameters that best approximate the ground state.
    """

    # Put your code here #
    H = create_Hamiltonian(h)
    params = np.random.random(qml.templates.QAOAEmbedding.shape(n_layers=4, n_wires=4))
    
    opt = qml.GradientDescentOptimizer()
    for i in range(1000):
        params = opt.step(lambda w : model(w, H), params)
        #val = model(params, H)
        #print("Step ", i, " val = ", val)
    #val = model(params, H)
    return params
# These functions are responsible for testing the solution.
def run(test_case_input: str) -> str:
    ins = json.loads(test_case_input)
    params = train(ins)
    return str(model(params, create_Hamiltonian(ins)))


def check(solution_output: str, expected_output: str) -> None:
    solution_output = json.loads(solution_output)
    expected_output = json.loads(expected_output)
    assert np.allclose(
        solution_output, expected_output, rtol=1e-1
    ), "The expected value is not correct."

test_cases = [['1.0', '-5.226251859505506'], ['2.3', '-9.66382463698038']]
for i, (input_, expected_output) in enumerate(test_cases):
    print(f"Running test case {i} with input '{input_}'...")

    try:
        output = run(input_)

    except Exception as exc:
        print(f"Runtime Error. {exc}")

    else:
        if message := check(output, expected_output):
            print(f"Wrong Answer. Have: '{output}'. Want: '{expected_output}'.")

        else:
            print("Correct!")
