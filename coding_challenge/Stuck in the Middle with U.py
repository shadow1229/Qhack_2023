import json
import pennylane as qml
import pennylane.numpy as np

n_qubits = 4
dev = qml.device("default.qubit", wires=n_qubits)

@qml.qnode(dev)
def circuit(angles):
    """A quantum circuit made from the quantum function U.

    Args:
        angles (list(float)): A list of angles containing theta_0, theta_1, theta_2, and theta_3 in that order. 
    Returns:
        (numpy.tensor): The probability of the fourth qubit.
    """

    # Put your code here #
    qml.Hadamard(wires=0)
    qml.Hadamard(wires=1)
    qml.Hadamard(wires=2)
    qml.Hadamard(wires=3)
    qml.RX(angles[0],wires=0)
    qml.CNOT(wires=[0,3])
    qml.CNOT(wires=[2,1])
    #do measurement on wire 0,2
    m0 = qml.measure(0)
    m2 = qml.measure(2)
    print(m0,m2)
    qml.cond(m0+m2 >=1, qml.U3)(angles[1],angles[2],angles[3], wires=3)
    qml.PauliZ(wires=3)
    return qml.probs(wires=3)

# These functions are responsible for testing the solution.
def run(test_case_input: str) -> str:
    angles = json.loads(test_case_input)
    output = circuit(angles).tolist()
    return str(output)

def check(solution_output: str, expected_output: str) -> None:
    solution_output = json.loads(solution_output)
    expected_output = json.loads(expected_output)
    print(solution_output)
    print(expected_output)

    assert np.allclose(solution_output, expected_output, rtol=1e-4)

test_cases = [['[1.0, 1.5, 2.0, 2.5]', '[0.79967628, 0.20032372]']]
for i, (input_, expected_output) in enumerate(test_cases):
    print(f"Running test case {i} with input '{input_}'...")
    output = run(input_)
    try:
        output = run(input_)

    except Exception as exc:
        print(f"Runtime Error. {exc}")

    else:
        if message := check(output, expected_output):
            print(f"Wrong Answer. Have: '{output}'. Want: '{expected_output}'.")

        else:
            print("Correct!")
