import json
import pennylane as qml
import pennylane.numpy as np

def U_psi(theta):
    """
    Quantum function that generates |psi>, Zenda's state wants to send to Reece.

    Args:
        theta (float): Parameter that generates the state.

    """
    qml.Hadamard(wires = 0)
    qml.CRX(theta, wires = [0,1])
    qml.CRZ(theta, wires = [0,1])

def is_unsafe(alpha, beta, epsilon):
    """
    Boolean function that we will use to know if a set of parameters is unsafe.

    Args:
        alpha (float): parameter used to encode the state.
        beta (float): parameter used to encode the state.
        epsilon (float): unsafe-tolerance.

    Returns:
        (bool): 'True' if alpha and beta are epsilon-unsafe coefficients. 'False' in the other case.

    """

    dev = qml.device("default.qubit", wires=[0,1])
    @qml.qnode(dev)
    def get_prob(alpha,beta,theta):
        qml.Hadamard(wires = 0)
        qml.CRX(theta, wires = [0,1])
        qml.CRZ(theta, wires = [0,1])
        qml.RZ(alpha,wires=0)
        qml.RZ(alpha,wires=1)
        qml.RX(beta,wires=0)
        qml.RX(beta,wires=1)      
        qml.adjoint(qml.CRZ)(theta,wires=[0,1])
        qml.adjoint(qml.CRX)(theta, wires = [0,1])   
        qml.Hadamard(wires = 0)
        return qml.probs()       
    for i in range(10000):
        theta = 2.0*np.pi*i/10000.0
        p = get_prob(alpha,beta,theta)[0]
        if p>= 1-epsilon:
            return True
    return False    

# These functions are responsible for testing the solution.
def run(test_case_input: str) -> str:
    ins = json.loads(test_case_input)
    output = is_unsafe(*ins)
    return str(output)

def check(solution_output: str, expected_output: str) -> None:
    
    def bool_to_int(string):
        if string == "True":
            return 1
        return 0

    solution_output = bool_to_int(solution_output)
    expected_output = bool_to_int(expected_output)
    assert solution_output == expected_output, "The solution is not correct."

test_cases = [['[0.1, 0.2, 0.3]', 'True'], ['[1.1, 1.2, 0.3]', 'False'], ['[1.1, 1.2, 0.4]', 'True'], ['[0.5, 1.9, 0.7]', 'True']]
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
